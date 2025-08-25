import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { name } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    })

    return Response.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
