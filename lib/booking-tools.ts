import { prisma } from "./prisma"
import { z } from "zod"
import { MeetingLinkManager } from "./meeting-links"
import { EmailService } from "./email-service"
import { format } from "date-fns"

// Static meeting room links (you can replace these with your actual meeting links)
const MEETING_ROOMS = [
  { id: "Room-1", link: "https://meet.google.com/abc-defg-hij" },
  { id: "Room-2", link: "https://meet.google.com/xyz-uvwx-yz" },
  { id: "Room-3", link: "https://meet.google.com/123-4567-89" },
  { id: "Room-4", link: "https://meet.google.com/qwe-rtyu-iop" },
  { id: "Room-5", link: "https://meet.google.com/asd-fghj-klz" },
]

export async function assignMeetingRoom(): Promise<{ id: string; link: string }> {
  try {
    // Check which rooms are currently in use
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    
    const activeBookings = await prisma.booking.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lt: oneHourFromNow,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      select: {
        meetingLink: true,
      },
    })

    // Find an available room
    const usedLinks = activeBookings.map(booking => booking.meetingLink)
    const availableRoom = MEETING_ROOMS.find(room => !usedLinks.includes(room.link))

    if (availableRoom) {
      return availableRoom
    }

    // If all rooms are busy, create a fallback room
    const fallbackRoom = {
      id: `Fallback-${Date.now()}`,
      link: `https://meet.google.com/fallback-${Date.now()}`,
    }
    
    console.log("All meeting rooms busy, using fallback room:", fallbackRoom.id)
    return fallbackRoom
  } catch (error) {
    console.error("Error assigning meeting room:", error)
    
    // Return a default room if there's an error
    return {
      id: "Default-Room",
      link: "https://meet.google.com/default-room",
    }
  }
}

export async function checkRoomAvailability(roomId: string, scheduledAt: Date): Promise<boolean> {
  try {
    const oneHourLater = new Date(scheduledAt.getTime() + 60 * 60 * 1000)
    
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        meetingLink: {
          contains: roomId,
        },
        scheduledAt: {
          gte: scheduledAt,
          lt: oneHourLater,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
    })

    return !conflictingBooking
  } catch (error) {
    console.error("Error checking room availability:", error)
    return false
  }
}

export async function getAvailableTimeSlots(counselorId: string, date: Date): Promise<string[]> {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get counselor's booked times for the day
    const bookedTimes = await prisma.booking.findMany({
      where: {
        counselorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["SCHEDULED", "CONFIRMED"],
        },
      },
      select: {
        scheduledAt: true,
      },
    })

    // Generate available time slots (9 AM to 8 PM, hourly)
    const availableSlots = []
    for (let hour = 9; hour <= 20; hour++) {
      const slotTime = new Date(date)
      slotTime.setHours(hour, 0, 0, 0)
      
      const isBooked = bookedTimes.some(booking => 
        Math.abs(booking.scheduledAt.getTime() - slotTime.getTime()) < 60 * 60 * 1000
      )
      
      if (!isBooked) {
        availableSlots.push(slotTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }))
      }
    }

    return availableSlots
  } catch (error) {
    console.error("Error getting available time slots:", error)
    return []
  }
}

export const getCounselorsSchema = z.object({
  specialty: z.string().optional().describe('Filter counselors by specialty (e.g., "anxiety", "relationships")'),
})

export const getAvailabilitySchema = z.object({
  counselorId: z.string().describe("The ID of the counselor to check availability for"),
  date: z.string().describe("Date in YYYY-MM-DD format to check availability"),
})

export const createBookingSchema = z.object({
  counselorId: z.string().describe("The ID of the counselor to book with"),
  userId: z.string().describe("The ID of the user making the booking"),
  scheduledAt: z.string().describe("The scheduled date and time in ISO format"),
  notes: z.string().optional().describe("Any additional notes for the booking"),
})

export async function getCounselors(specialty?: string, userId?: string) {
  const counselors = await prisma.counselor.findMany({
    where: {
      isActive: true,
      ...(specialty && {
        specialties: {
          has: specialty,
        },
      }),
    },
    select: {
      id: true,
      name: true,
      specialties: true,
      bio: true,
    },
  })

  if (userId) {
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
      select: { preferredCounselorId: true },
    })

    if (userPreferences?.preferredCounselorId) {
      // Move preferred counselor to the top of the list
      const preferredIndex = counselors.findIndex((c: any) => c.id === userPreferences.preferredCounselorId)
      if (preferredIndex > 0) {
        const preferred = counselors.splice(preferredIndex, 1)[0]
        counselors.unshift(preferred)
      }
    }
  }

  return counselors
}

export async function getCounselorAvailability(counselorId: string, date: string, userId?: string) {
  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay()

  // Get counselor's general availability for this day of week
  const availability = await prisma.counselorAvailability.findMany({
    where: {
      counselorId,
      dayOfWeek,
      isActive: true,
    },
  })

  if (availability.length === 0) {
    return { available: false, slots: [] }
  }

  // Get existing bookings for this date
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const existingBookings = await prisma.booking.findMany({
    where: {
      counselorId,
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
    select: {
      scheduledAt: true,
      duration: true,
    },
  })

  let userPreferences = null
  if (userId) {
    userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
      select: { preferredTimeSlots: true, timezone: true },
    })
  }

  // Generate available time slots
  const slots = []
  for (const avail of availability) {
    const [startHour, startMinute] = avail.startTime.split(":").map(Number)
    const [endHour, endMinute] = avail.endTime.split(":").map(Number)

    let currentTime = new Date(targetDate)
    currentTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date(targetDate)
    endTime.setHours(endHour, endMinute, 0, 0)

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + 60 * 60 * 1000) // 1 hour slots

      // Check if this slot conflicts with existing bookings
      const hasConflict = existingBookings.some((booking: any) => {
        const bookingStart = new Date(booking.scheduledAt)
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration || 60) * 60 * 1000)

        return (
          (currentTime >= bookingStart && currentTime < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (currentTime <= bookingStart && slotEnd >= bookingEnd)
        )
      })

      if (!hasConflict && slotEnd <= endTime) {
        const hour = currentTime.getHours()
        let timeSlotCategory = "other"
        if (hour >= 8 && hour < 12) timeSlotCategory = "morning"
        else if (hour >= 12 && hour < 17) timeSlotCategory = "afternoon"
        else if (hour >= 17 && hour < 20) timeSlotCategory = "evening"

        const isPreferred = userPreferences?.preferredTimeSlots?.includes(timeSlotCategory) || false

        slots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
          isPreferred,
        })
      }

      currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000) // Move to next hour
    }
  }

  if (userPreferences?.preferredTimeSlots?.length) {
    slots.sort((a, b) => {
      if (a.isPreferred && !b.isPreferred) return -1
      if (!a.isPreferred && b.isPreferred) return 1
      return 0
    })
  }

  return {
    available: slots.length > 0,
    slots,
  }
}

export async function createBooking(data: {
  counselorId: string
  userId: string
  scheduledAt: string
  notes?: string
}) {
  const scheduledDate = new Date(data.scheduledAt)
  const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000) // 1 hour duration

  // Validate no conflicts exist
  const conflicts = await prisma.booking.findMany({
    where: {
      counselorId: data.counselorId,
      scheduledAt: {
        lt: endDate,
      },
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
  })

  // Check for time conflicts
  const hasConflict = conflicts.some((booking: any) => {
    const bookingEnd = new Date(booking.scheduledAt.getTime() + (booking.duration || 60) * 60 * 1000)
    return scheduledDate < bookingEnd && endDate > booking.scheduledAt
  })

  if (hasConflict) {
    throw new Error("This time slot conflicts with an existing booking")
  }

  // Get user and counselor details
  const [user, counselor] = await Promise.all([
    prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true, name: true },
    }),
    prisma.counselor.findUnique({
      where: { id: data.counselorId },
      select: { name: true, email: true },
    }),
  ])

  if (!user || !counselor) {
    throw new Error("User or counselor not found")
  }

  // Get an available meeting link
  const meetingLinkAssignment = await MeetingLinkManager.getAvailableMeetingLink(scheduledDate, 60)

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      counselorId: data.counselorId,
      userId: data.userId,
      scheduledAt: scheduledDate,
      notes: data.notes,
      status: "SCHEDULED",
      meetingLink: meetingLinkAssignment.meetingLink,
      meetingId: meetingLinkAssignment.meetingId,
    },
    include: {
      counselor: {
        select: {
          name: true,
          email: true,
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  // Send confirmation email
  try {
    await EmailService.sendBookingConfirmation({
      userEmail: user.email,
      userName: user.name || user.email,
      counselorName: counselor.name,
      appointmentDate: format(scheduledDate, "EEEE, MMMM d, yyyy"),
      appointmentTime: format(scheduledDate, "h:mm a"),
      meetingLink: meetingLinkAssignment.meetingLink,
      notes: data.notes,
    })
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError)
    // Don't fail the booking if email fails
  }

  return {
    ...booking,
    meetingLinkAvailable: meetingLinkAssignment.isAvailable,
  }
}

/**
 * Check if a specific time slot is available for a counselor
 */
export async function checkTimeSlotAvailability(
  counselorId: string,
  scheduledAt: string,
  duration: number = 60
): Promise<{ available: boolean; conflicts: any[] }> {
  const startTime = new Date(scheduledAt)
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

  // Check for conflicts
  const conflicts = await prisma.booking.findMany({
    where: {
      counselorId,
      scheduledAt: {
        lt: endTime,
      },
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
  })

  // Check for time overlaps
  const hasConflict = conflicts.some((booking: any) => {
    const bookingEnd = new Date(booking.scheduledAt.getTime() + (booking.duration || 60) * 60 * 1000)
    return startTime < bookingEnd && endTime > booking.scheduledAt
  })

  return {
    available: !hasConflict,
    conflicts: hasConflict ? conflicts : [],
  }
}

/**
 * Get all upcoming bookings for a user
 */
export async function getUserUpcomingBookings(userId: string) {
  return await prisma.booking.findMany({
    where: {
      userId,
      scheduledAt: {
        gte: new Date(),
      },
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
    include: {
      counselor: {
        select: {
          name: true,
          specialties: true,
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  })
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
    include: {
      counselor: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  if (!booking) {
    throw new Error("Booking not found or cannot be cancelled")
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })

  // Send cancellation email
  try {
    await EmailService.sendCancellationEmail(
      booking.user.email,
      booking.user.name || booking.user.email,
      booking.counselor.name,
      format(booking.scheduledAt, "EEEE, MMMM d, yyyy"),
      format(booking.scheduledAt, "h:mm a")
    )
  } catch (emailError) {
    console.error("Failed to send cancellation email:", emailError)
  }

  return updatedBooking
}
