import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

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

    const { counselorId, date, time, duration } = await req.json()

    if (!counselorId || !date || !time || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const scheduledAt = new Date(`${date}T${time}:00`)
    const endTime = new Date(scheduledAt.getTime() + duration * 60 * 1000)

    // Check counselor schedule
    const activeSetting = await prisma.bookingAssignmentSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { selectedCounselors: true },
    })

    if (
      activeSetting?.mode === "SELECTED_COUNSELORS" &&
      !activeSetting.selectedCounselors.some((row) => row.counselorId === counselorId)
    ) {
      return NextResponse.json({ available: false, reason: "Counselor is not in current assignment scope" }, { status: 403 })
    }

    const counselor = await prisma.counselor.findFirst({
      where: { id: counselorId, isActive: true },
      include: { 
        availability: {
          where: { isActive: true }
        }
      }
    })

    if (!counselor) {
      return NextResponse.json(
        { available: false, reason: 'Counselor not found' },
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
        available: false, 
        reason: 'Counselor not available at this time',
        availableSlots: counselor.availability
      })
    }

    // Check for conflicts with existing bookings
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
          available: false, 
          reason: 'Time slot already booked',
          nextAvailable: bookingEnd
        })
      }
    }

    return NextResponse.json({ 
      available: true, 
      counselor: counselor.name,
      scheduledAt,
      endTime
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
