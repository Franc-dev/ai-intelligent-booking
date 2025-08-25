import { NextRequest, NextResponse } from 'next/server'
import { BookingAgent } from '@/lib/agent'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, context } = await req.json()
    
    // Get authenticated user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get user preferences and context
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
      include: {
        preferredCounselor: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
    })

    // Get available counselors
    const availableCounselors = await prisma.counselor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        specialties: true,
        bio: true,
      },
    })

    // Get conversation history from database
    const dbConversationHistory = await prisma.aIConversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { messages: true },
      take: 10
    })

    // Flatten conversation history
    const flatHistory = dbConversationHistory
      .flatMap((conv: any) => conv.messages)
      .filter((msg: any): msg is { role: string; content: string } => 
        typeof msg === 'object' && msg !== null && 'role' in msg && 'content' in msg
      )
      .reverse()
      .slice(-20)

    // Create enhanced context
    const enhancedContext = {
      userPreferences: userPreferences ? {
        ...userPreferences,
        userId: user.id
      } : {
        userId: user.id,
        preferredCounselorId: null,
        preferredTimeSlots: [],
        timezone: 'UTC',
        notificationSettings: {}
      },
      conversationHistory: flatHistory,
      userRole: user.role,
      availableCounselors,
      ...context
    }

    // Process message with BookingAgent
    const response = await BookingAgent.processMessage(
      message,
      user.id,
      context?.conversationId,
      enhancedContext
    )

    // Save conversation
    if (conversationHistory) {
      const conversationId = await BookingAgent.saveConversation(
        user.id,
        [...conversationHistory, { role: 'user', content: message }],
        enhancedContext
      )
      response.conversationId = conversationId || undefined
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'I apologize, but I encountered an error. Please try again.'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve conversation history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const conversations = await prisma.aIConversation.findMany({
      where: {
        userId,
        ...(conversationId ? { id: conversationId } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: conversationId ? 1 : 10
    })

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve conversation history' },
      { status: 500 }
    )
  }
}
