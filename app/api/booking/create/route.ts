import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'
import { MeetingLinkManager } from '@/lib/meeting-links'
import { EmailService } from '@/lib/email-service'

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { counselorId, date, time, duration, notes } = await req.json()

    if (!counselorId || !date || !time || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const scheduledAt = new Date(`${date}T${time}:00`)
    const endTime = new Date(scheduledAt.getTime() + duration * 60 * 1000)

    // Double-check availability
    const counselor = await prisma.counselor.findUnique({
      where: { id: counselorId },
      include: { 
        availability: {
          where: { isActive: true }
        }
      }
    })

    if (!counselor) {
      return NextResponse.json(
        { success: false, error: 'Counselor not found' },
        { status: 404 }
      )
    }

    // Check day of week availability
    const dayOfWeek = scheduledAt.getDay()
    const timeStr = time
    
    const dayAvailability = counselor.availability.find(av => 
      av.dayOfWeek === dayOfWeek && 
      av.startTime <= timeStr && 
      av.endTime >= timeStr
    )

    if (!dayAvailability) {
      return NextResponse.json({ 
        success: false, 
        error: 'Counselor not available at this time'
      })
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        counselorId,
        scheduledAt: { lt: endTime },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    })

    if (conflictingBooking) {
      const bookingEnd = new Date(
        conflictingBooking.scheduledAt.getTime() + 
        (conflictingBooking.duration || 60) * 60 * 1000
      )
      
      if (scheduledAt < bookingEnd && endTime > conflictingBooking.scheduledAt) {
        return NextResponse.json({ 
          success: false, 
          error: 'Time slot already booked'
        })
      }
    }

    // Get meeting link
    let meetingLink = null
    let meetingId = null
    
    try {
      const meetingAssignment = await MeetingLinkManager.getAvailableMeetingLink(
        scheduledAt, 
        duration
      )
      meetingLink = meetingAssignment.meetingLink
      meetingId = meetingAssignment.meetingId
    } catch (error) {
      console.warn('Failed to get meeting link:', error)
      // Continue without meeting link - can be added later
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        counselorId,
        scheduledAt,
        duration,
        meetingLink,
        meetingId,
        notes: notes?.trim() || null,
        status: 'SCHEDULED'
      },
      include: {
        counselor: true,
        user: true
      }
    })

    // Send confirmation email (non-blocking but awaited here for visibility)
    try {
      const appointmentDate = scheduledAt.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit'
      })
      const appointmentTime = scheduledAt.toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
      })

      await EmailService.sendBookingConfirmation({
        userEmail: booking.user.email || user.email || '',
        userName: booking.user.name || booking.user.email || 'User',
        counselorName: booking.counselor.name,
        appointmentDate,
        appointmentTime,
        meetingLink: booking.meetingLink || undefined,
        notes: booking.notes || undefined,
      })
      // Notify counselor too
      if (booking.counselor.email) {
        await EmailService.sendCounselorNotification({
          counselorEmail: booking.counselor.email,
          counselorName: booking.counselor.name,
          userName: booking.user.name || booking.user.email || 'User',
          appointmentDate,
          appointmentTime,
          meetingLink: booking.meetingLink || undefined,
          notes: booking.notes || undefined,
        })
      }
    } catch (emailError) {
      console.warn('Failed to send booking confirmation email:', emailError)
      // Do not fail the booking because of email issues
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        scheduledAt: booking.scheduledAt,
        duration: booking.duration,
        counselorName: booking.counselor.name,
        meetingLink: booking.meetingLink,
        meetingId: booking.meetingId,
        notes: booking.notes
      }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create booking' 
      },
      { status: 500 }
    )
  }
}
