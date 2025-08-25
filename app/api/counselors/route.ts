import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const specialty = searchParams.get('specialty')
    const date = searchParams.get('date')

    // Build where clause
    const where: any = { isActive: true }
    if (specialty) {
      where.specialties = { has: specialty }
    }

    // Get counselors with availability
    const counselors = await prisma.counselor.findMany({
      where,
      include: {
        availability: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Format response
    const formattedCounselors = counselors.map(counselor => ({
      id: counselor.id,
      name: counselor.name,
      specialties: counselor.specialties,
      bio: counselor.bio || 'Professional counselor with expertise in their field.',
      availability: counselor.availability.map(av => ({
        dayOfWeek: av.dayOfWeek,
        startTime: av.startTime,
        endTime: av.endTime,
        timezone: av.timezone
      }))
    }))

    return NextResponse.json({
      counselors: formattedCounselors,
      total: formattedCounselors.length
    })

  } catch (error) {
    console.error('Counselors API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch counselors' },
      { status: 500 }
    )
  }
}
