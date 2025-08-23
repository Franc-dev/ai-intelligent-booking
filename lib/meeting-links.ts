import { prisma } from "./prisma"

// Pool of available Google Meet links
const MEETING_LINKS = [
  "https://meet.google.com/edk-quho-xck",
  "https://meet.google.com/ycw-qhgp-aiy",
  "https://meet.google.com/mpu-fcgb-uah",
  "https://meet.google.com/hez-xesx-khq",
  "https://meet.google.com/obk-uwdr-mqt",
  "https://meet.google.com/sqe-ikdj-shj",
  "https://meet.google.com/pmf-aurw-zcf",
  "https://meet.google.com/sum-caqe-bct",
]

interface MeetingLinkAssignment {
  meetingLink: string
  meetingId: string
  isAvailable: boolean
}

export class MeetingLinkManager {
  /**
   * Get an available meeting link for a specific time slot
   * Ensures no conflicts with existing bookings
   */
  static async getAvailableMeetingLink(
    scheduledAt: Date,
    duration: number = 60
  ): Promise<MeetingLinkAssignment> {
    const endTime = new Date(scheduledAt.getTime() + duration * 60 * 1000)
    
    // Check for conflicts with existing bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        scheduledAt: {
          lt: endTime,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
        meetingLink: true,
      },
    })

    // Find which meeting links are in use during this time
    const usedLinks = new Set<string>()
    
    for (const booking of conflictingBookings) {
      const bookingEnd = new Date(booking.scheduledAt.getTime() + (booking.duration || 60) * 60 * 1000)
      
      // Check if there's any overlap
      if (
        (scheduledAt < bookingEnd && endTime > booking.scheduledAt) &&
        booking.meetingLink
      ) {
        usedLinks.add(booking.meetingLink)
      }
    }

    // Find an available link
    const availableLink = MEETING_LINKS.find(link => !usedLinks.has(link))
    
    if (availableLink) {
      const meetingId = this.extractMeetingId(availableLink)
      return {
        meetingLink: availableLink,
        meetingId,
        isAvailable: true,
      }
    }

    // If no links available, generate a fallback
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fallbackLink = `https://meet.google.com/${fallbackId}`
    
    return {
      meetingLink: fallbackLink,
      meetingId: fallbackId,
      isAvailable: false,
    }
  }

  /**
   * Extract meeting ID from Google Meet URL
   */
  private static extractMeetingId(meetingLink: string): string {
    const match = meetingLink.match(/meet\.google\.com\/([a-z-]+)/)
    return match ? match[1] : `meeting-${Date.now()}`
  }

  /**
   * Check if a specific meeting link is available for a time slot
   */
  static async isMeetingLinkAvailable(
    meetingLink: string,
    scheduledAt: Date,
    duration: number = 60
  ): Promise<boolean> {
    const endTime = new Date(scheduledAt.getTime() + duration * 60 * 1000)
    
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        meetingLink,
        scheduledAt: {
          lt: endTime,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
    })

    if (!conflictingBooking) return true

    const bookingEnd = new Date(conflictingBooking.scheduledAt.getTime() + (conflictingBooking.duration || 60) * 60 * 1000)
    
    // Check if there's any overlap
    return !(scheduledAt < bookingEnd && endTime > conflictingBooking.scheduledAt)
  }

  /**
   * Get all meeting links with their availability status
   */
  static async getAllMeetingLinksStatus(): Promise<Array<{
    link: string
    id: string
    isAvailable: boolean
    nextAvailable: Date | null
  }>> {
    const now = new Date()
    const results = []

    for (const link of MEETING_LINKS) {
      const meetingId = this.extractMeetingId(link)
      
      // Find the next booking for this link
      const nextBooking = await prisma.booking.findFirst({
        where: {
          meetingLink: link,
          scheduledAt: {
            gte: now,
          },
          status: {
            in: ["SCHEDULED", "CONFIRMED"],
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        select: {
          scheduledAt: true,
          duration: true,
        },
      })

      const isAvailable = !nextBooking || nextBooking.scheduledAt > now
      const nextAvailable = nextBooking ? 
        new Date(nextBooking.scheduledAt.getTime() + (nextBooking.duration || 60) * 60 * 1000) : 
        null

      results.push({
        link,
        id: meetingId,
        isAvailable,
        nextAvailable,
      })
    }

    return results
  }

  /**
   * Release a meeting link (for cancellations)
   */
  static async releaseMeetingLink(meetingLink: string): Promise<void> {
    // This method can be used when a booking is cancelled
    // to ensure the link becomes available again
    // The actual release happens automatically when the booking is updated
    console.log(`Meeting link released: ${meetingLink}`)
  }
}
