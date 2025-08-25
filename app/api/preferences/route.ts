import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { preferredCounselorId, preferredTimeSlots, timezone, notificationSettings } = await req.json()

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        preferredCounselorId,
        preferredTimeSlots,
        timezone,
        notificationSettings,
      },
      create: {
        userId: user.id,
        preferredCounselorId,
        preferredTimeSlots,
        timezone,
        notificationSettings,
      },
    })

    return Response.json({ success: true, preferences })
  } catch (error) {
    console.error("Preferences update error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
