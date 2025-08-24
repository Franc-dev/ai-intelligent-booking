import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AIAgent } from "@/lib/ai-agent"

export async function POST(req: Request) {
  try {
    const { message, bookingDetails } = await req.json()
    const user = await getCurrentUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid message format" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Get user preferences
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

    // Get all available counselors
    const availableCounselors = await prisma.counselor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        specialties: true,
        bio: true,
      },
    }).then(counselors => counselors.map(c => ({
      ...c,
      bio: c.bio || "Professional counselor with expertise in their field."
    })))

    // Get conversation history
    const conversationHistory = await prisma.aIConversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        messages: true,
      },
    })

    // Flatten conversation history and ensure proper typing
    const flatHistory = conversationHistory
      .flatMap(conv => conv.messages)
      .filter((msg): msg is { role: string; content: string } => 
        typeof msg === 'object' && msg !== null && 'role' in msg && 'content' in msg
      )
      .reverse()
      .slice(-20) // Last 20 messages for context

    // Create AI Agent context with guaranteed user ID
    const aiContext = {
      userPreferences: userPreferences ? {
        ...userPreferences,
        userId: user.id // Ensure user ID is always present
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
    }

    // Create AI Agent instance
    const aiAgent = new AIAgent(aiContext)

    // Handle booking approval case
    if (bookingDetails && (message.toLowerCase().includes('yes') || message.toLowerCase().includes('confirm'))) {
      try {
        // Create the booking directly using the provided details
        const booking = await aiAgent.createBooking(bookingDetails)
        
        if (booking) {
          const aiResponse = aiAgent.generateBookingConfirmation(booking)
          
          // Store conversation in database
          const conversation = await prisma.aIConversation.create({
            data: {
              userId: user.id,
              messages: [
                { role: "user", content: message },
                { role: "assistant", content: aiResponse }
              ],
            },
          })

          return new Response(JSON.stringify({ 
            response: aiResponse,
            conversationId: conversation.id 
          }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
          })
        }
      } catch (error) {
        console.error("Booking creation failed:", error)
        const errorResponse = `I encountered an issue while trying to book your session: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact support.`
        
        // Store conversation in database
        const conversation = await prisma.aIConversation.create({
          data: {
            userId: user.id,
            messages: [
              { role: "user", content: message },
              { role: "assistant", content: errorResponse }
            ],
          },
        })

        return new Response(JSON.stringify({ 
          response: errorResponse,
          conversationId: conversation.id 
        }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      }
    }

    // Generate AI response for normal messages
    const aiResponse = await aiAgent.generateResponse(message)

    // Store conversation in database
    const conversation = await prisma.aIConversation.create({
      data: {
        userId: user.id,
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: aiResponse }
        ],
        context: {
          userPreferences,
          userRole: user.role,
        },
      },
    })

    return new Response(JSON.stringify({ 
      content: aiResponse,
      conversationId: conversation.id
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
