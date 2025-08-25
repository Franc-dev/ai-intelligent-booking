// libs/agent.ts
import { MODELS, jsonObjectCompletion, chatCompletion } from './openrouter'
import { z } from 'zod'
import { prisma } from './prisma'
import { MeetingLinkManager } from './meeting-links'

// Mental health knowledge base
const MENTAL_HEALTH_CONTEXT = `
You are a compassionate mental health AI assistant that helps users with:
1. Booking counseling sessions
2. Providing general mental health information and support
3. Crisis intervention guidance (always recommend immediate professional help for emergencies)
4. Self-care tips and coping strategies
5. Understanding different therapy types and approaches

Important guidelines:
- Always maintain a supportive, non-judgmental tone
- For emergencies, immediately recommend calling emergency services
- Never provide medical diagnoses
- Encourage professional help when appropriate
- Be empathetic and understanding
- Respect user privacy and confidentiality
`

export class BookingAgent {
  static async processMessage(
    message: string,
    userId: string,
    conversationId?: string,
    context?: any
  ) {
    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY environment variable is not set');
      
      // Provide basic fallback responses without AI
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
        return {
          type: 'booking',
          message: `I'd be happy to help you book a counseling session! However, I'm currently in limited mode because the AI service isn't configured.

To get full AI-powered booking assistance:
1. Create a .env.local file in your project root
2. Add: OPENROUTER_API_KEY="your-api-key-here"
3. Get your API key from https://openrouter.ai/
4. Restart the development server

For now, I can help you with basic information about our services.`,
          needsBookingForm: true,
          error: 'OPENROUTER_API_KEY not configured'
        }
      }
      
      return {
        type: 'general',
        message: `I'm currently in limited mode because the AI service isn't configured. I can help you with basic information about our counseling services, but for full AI assistance, please configure your OpenRouter API key.`,
        error: 'OPENROUTER_API_KEY not configured'
      }
    }

    try {
      // First, determine intent and gather information
      let intentAnalysis: { object: { type: 'booking' | 'mental_health_query' | 'general_support' | 'crisis'; message: string; needsBookingForm: boolean; intent: string; confidence: number } }
      let modelUsed: 'primary' | 'fallback' | 'backup' | 'emergency' = 'primary'
      
      try {
        console.log('Attempting to use primary model:', MODELS.primary)
        intentAnalysis = await jsonObjectCompletion({
          model: MODELS.primary,
          system: `${MENTAL_HEALTH_CONTEXT}
          
          Analyze the user's message and determine:
          1. Primary intent (booking, mental_health_query, general_support, crisis)
          2. Required information for booking (if applicable)
          3. Whether to show a booking form. Only set to true if the user explicitly asks to book or agrees after you gently offer help. Otherwise false.
          4. Provide a short, compassionate response with 2-4 practical tips when intent is mental_health_query. Avoid salesy language. Ask one follow‑up question.
          
          Return a JSON object with:
          - type: "booking" | "mental_health_query" | "general_support" | "crisis"
          - message: helpful response text
          - needsBookingForm: boolean (true if user wants to book)
          - intent: the detected intent
          - confidence: 0-1 score`,
          prompt: message,
          schemaHint: '{"type":"booking|mental_health_query|general_support|crisis","message":"string","needsBookingForm":true,"intent":"string","confidence":0.0}'
        }) as any
        console.log('Primary model succeeded:', intentAnalysis)
      } catch (primaryError) {
        console.error('Primary model failed:', primaryError)
        modelUsed = 'fallback'
        
        try {
          console.log('Attempting to use fallback model:', MODELS.fallback)
          intentAnalysis = await jsonObjectCompletion({
            model: MODELS.fallback,
            system: `${MENTAL_HEALTH_CONTEXT}
            
            Analyze the user's message and determine:
            1. Primary intent (booking, mental_health_query, general_support, crisis)
            2. Required information for booking (if applicable)
            3. Whether to show a booking form. Only set to true if the user explicitly asks to book or agrees after you gently offer help. Otherwise false.
            4. Provide a short, compassionate response with 2-4 practical tips when intent is mental_health_query. Avoid salesy language. Ask one follow‑up question.
            
            Return a JSON object with:
            - type: "booking" | "mental_health_query" | "general_support" | "crisis"
            - message: helpful response text
            - needsBookingForm: boolean (true if user wants to book)
            - intent: the detected intent
            - confidence: 0-1 score`,
            prompt: message,
            schemaHint: '{"type":"booking|mental_health_query|general_support|crisis","message":"string","needsBookingForm":true,"intent":"string","confidence":0.0}'
          }) as any
          console.log('Fallback model succeeded:', intentAnalysis)
        } catch (fallbackError) {
          console.error('Fallback model failed:', fallbackError)
          modelUsed = 'backup'
          
          try {
            console.log('Attempting to use backup model:', MODELS.backup)
            intentAnalysis = await jsonObjectCompletion({
              model: MODELS.backup,
              system: `${MENTAL_HEALTH_CONTEXT}
              
              Analyze the user's message and determine:
              1. Primary intent (booking, mental_health_query, general_support, crisis)
              2. Required information for booking (if applicable)
              3. Whether to show a booking form. Only set to true if the user explicitly asks to book or agrees after you gently offer help. Otherwise false.
              4. Provide a short, compassionate response with 2-4 practical tips when intent is mental_health_query. Avoid salesy language. Ask one follow‑up question.
              
              Return a JSON object with:
              - type: "booking" | "mental_health_query" | "general_support" | "crisis"
              - message: helpful response text
              - needsBookingForm: boolean (true if user wants to book)
              - intent: the detected intent
              - confidence: 0-1 score`,
              prompt: message,
              schemaHint: '{"type":"booking|mental_health_query|general_support|crisis","message":"string","needsBookingForm":true,"intent":"string","confidence":0.0}'
            }) as any
            console.log('Backup model succeeded:', intentAnalysis)
          } catch (backupError) {
            console.error('Backup model failed:', backupError)
            modelUsed = 'emergency'
            
            try {
              console.log('Attempting to use emergency model:', MODELS.emergency)
              intentAnalysis = await jsonObjectCompletion({
                model: MODELS.emergency,
                system: `${MENTAL_HEALTH_CONTEXT}
                
                Analyze the user's message and determine:
                1. Primary intent (booking, mental_health_query, general_support, crisis)
                2. Required information for booking (if applicable)
                3. Whether to show a booking form. Only set to true if the user explicitly asks to book or agrees after you gently offer help. Otherwise false.
                4. Provide a short, compassionate response with 2-4 practical tips when intent is mental_health_query. Avoid salesy language. Ask one follow‑up question.
                
                Return a JSON object with:
                - type: "booking" | "mental_health_query" | "general_support" | "crisis"
                - message: helpful response text
                - needsBookingForm: boolean (true if user wants to book)
                - intent: the detected intent
                - confidence: 0-1 score`,
                prompt: message,
                schemaHint: '{"type":"booking|mental_health_query|general_support|crisis","message":"string","needsBookingForm":true,"intent":"string","confidence":0.0}'
              }) as any
              console.log('Emergency model succeeded:', intentAnalysis)
            } catch (emergencyError) {
              console.error('All models failed:', { primaryError, fallbackError, backupError, emergencyError })
              
              // Provide a helpful error message with debugging info
              return {
                type: 'error',
                message: `I'm experiencing technical difficulties with the AI service. Here's what I can tell you:

**Error Details:**
- Primary model (GPT-3.5): Failed
- Fallback model (Claude): Failed  
- Backup model (Gemini): Failed
- Emergency model (Llama): Failed

**Possible Causes:**
1. OpenRouter API key might be invalid or expired
2. Rate limiting or quota exceeded
3. Network connectivity issues
4. Model availability issues

**To troubleshoot:**
1. Check your OpenRouter API key at https://openrouter.ai/keys
2. Verify your account has sufficient credits
3. Check OpenRouter status at https://status.openrouter.ai
4. Try again in a few minutes

For now, I can help you with basic information about our counseling services.`,
                error: 'All AI models failed',
                debugInfo: {
                  modelUsed,
                  errors: {
                    primary: primaryError instanceof Error ? primaryError.message : String(primaryError),
                    fallback: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
                    backup: backupError instanceof Error ? backupError.message : String(backupError),
                    emergency: emergencyError instanceof Error ? emergencyError.message : String(emergencyError)
                  }
                }
              }
            }
          }
        }
      }

      // Handle crisis situations immediately
      if (intentAnalysis.object.type === 'crisis') {
        return {
          type: 'crisis',
          message: `I'm very concerned about what you're going through. Please reach out for immediate help:

🚨 **Emergency Services**: 911 (US) or your local emergency number
📞 **Crisis Hotlines**:
   - National Suicide Prevention Lifeline: 988
   - Crisis Text Line: Text HOME to 741741
   - SAMHSA Helpline: 1-800-662-4357

You don't have to face this alone. Professional help is available 24/7.`,
          requiresImmediateAction: true
        }
      }

      // Generate response with supportive tone and avoid premature booking CTA
      let response: { text: string }
      try {
        response = await chatCompletion({
          model: MODELS.primary,
          system: `${MENTAL_HEALTH_CONTEXT}
          
          You can help users with:
          1. Finding and booking counselors
          2. Checking availability
          3. Managing existing bookings
          4. Providing mental health support and information
          
          If the user expresses distress (e.g., burnout), first provide 2-4 concrete coping tips (e.g., micro‑breaks, boundary setting, sleep hygiene). Ask one gentle follow‑up question to better understand.
          Offer booking as an option only after giving support (e.g., "If you'd like, I can also help schedule a session").
          When a user clearly wants to book, guide them through the process and ask for:
          - Preferred counselor or specialty
          - Preferred date and time
          - Session duration
          - Any specific concerns or topics
          
          Always be supportive and professional. If they want to proceed with booking, 
          let them know you'll help them fill out the booking form.`,
          prompt: message
        })
      } catch (responseError) {
        console.warn('Primary model response generation failed, using fallback:', responseError)
        // Use a simple fallback response if AI generation fails
        response = {
          text: `I understand you're looking for help. Based on your message, I can assist you with:
          
1. **Booking a counseling session** - I can help you find available counselors and schedule appointments
2. **Mental health support** - I can provide information and resources
3. **General guidance** - I'm here to help with any questions you have

What would you like to do today?`
        }
      }

      // Check if we need to render a booking form
      const needsBookingForm = intentAnalysis.object.needsBookingForm

      return {
        type: intentAnalysis.object.type,
        message: intentAnalysis.object.message,
        needsBookingForm,
        intent: intentAnalysis.object.intent,
        confidence: intentAnalysis.object.confidence,
        conversationId
      }

    } catch (error) {
      console.error('BookingAgent error:', error)
      return {
        type: 'error',
        message: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Helper methods for direct database operations
  static async getAvailableCounselors(specialty?: string, date?: string) {
    const where: any = { isActive: true }
    if (specialty) {
      where.specialties = { has: specialty }
    }

    const counselors = await prisma.counselor.findMany({
      where,
      include: {
        availability: true,
        bookings: date ? {
          where: {
            scheduledAt: {
              gte: new Date(date),
              lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
            },
            status: { in: ['SCHEDULED', 'CONFIRMED'] }
          }
        } : false
      }
    })

    return counselors.map(counselor => ({
      id: counselor.id,
      name: counselor.name,
      specialties: counselor.specialties,
      bio: counselor.bio,
      availability: counselor.availability,
      isAvailable: date ? counselor.bookings?.length === 0 : true
    }))
  }

  static async checkCounselorAvailability(
    counselorId: string,
    date: string,
    time: string,
    duration: number
  ) {
    const scheduledAt = new Date(`${date}T${time}:00`)
    const endTime = new Date(scheduledAt.getTime() + duration * 60 * 1000)

    // Check counselor schedule
    const counselor = await prisma.counselor.findUnique({
      where: { id: counselorId },
      include: { availability: true }
    })

    if (!counselor) {
      return { available: false, reason: 'Counselor not found' }
    }

    // Check day of week availability
    const dayOfWeek = scheduledAt.getDay()
    const timeStr = time
    
    const dayAvailability = counselor.availability.find(av => 
      av.dayOfWeek === dayOfWeek && 
      av.startTime <= timeStr && 
      av.endTime >= timeStr &&
      av.isActive
    )

    if (!dayAvailability) {
      return { 
        available: false, 
        reason: 'Counselor not available at this time',
        availableSlots: counselor.availability.filter(av => av.isActive)
      }
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
        return { 
          available: false, 
          reason: 'Time slot already booked',
          nextAvailable: bookingEnd
        }
      }
    }

    return { available: true, counselor: counselor.name }
  }

  static async createBooking(bookingData: {
    userId: string
    counselorId: string
    date: string
    time: string
    duration: number
    notes?: string
    conversationId?: string
  }) {
    try {
      const { userId, counselorId, date, time, duration, notes, conversationId } = bookingData
      const scheduledAt = new Date(`${date}T${time}:00`)
      
      // Double-check availability
      const availabilityResult = await this.checkCounselorAvailability(
        counselorId, date, time, duration
      )
      
      if (!availabilityResult.available) {
        return { 
          success: false, 
          error: availabilityResult.reason,
          suggestedSlots: availabilityResult.availableSlots 
        }
      }

      // Get meeting link
      const meetingAssignment = await MeetingLinkManager.getAvailableMeetingLink(
        scheduledAt, 
        duration
      )

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          counselorId,
          scheduledAt,
          duration,
          meetingLink: meetingAssignment.meetingLink,
          meetingId: meetingAssignment.meetingId,
          notes,
          aiConversationId: conversationId,
          status: 'SCHEDULED'
        },
        include: {
          counselor: true,
          user: true
        }
      })

      return {
        success: true,
        booking: {
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          duration: booking.duration,
          counselorName: booking.counselor.name,
          meetingLink: booking.meetingLink,
          meetingId: booking.meetingId
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async getBookingDetails(userId: string, bookingId?: string) {
    const where: any = { userId }
    if (bookingId) {
      where.id = bookingId
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        counselor: true
      },
      orderBy: { scheduledAt: 'asc' }
    })

    return bookings.map(booking => ({
      id: booking.id,
      scheduledAt: booking.scheduledAt,
      duration: booking.duration,
      status: booking.status,
      counselorName: booking.counselor.name,
      counselorSpecialties: booking.counselor.specialties,
      meetingLink: booking.meetingLink,
      notes: booking.notes
    }))
  }

  static async cancelBooking(bookingId: string, userId: string) {
    try {
      const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId }
      })

      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      if (booking.status === 'CANCELLED') {
        return { success: false, error: 'Booking already cancelled' }
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      })

      // Release meeting link
      if (booking.meetingLink) {
        await MeetingLinkManager.releaseMeetingLink(booking.meetingLink)
      }

      return { 
        success: true, 
        message: 'Booking cancelled successfully',
        booking: updatedBooking
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  static async saveConversation(
    userId: string | undefined,
    messages: Array<{ role: string; content: string }>,
    context?: any
  ) {
    try {
      if (userId) {
        const conversation = await prisma.aIConversation.create({
          data: {
            userId,
            messages: messages,
            context: context || {}
          }
        })
        return conversation.id
      }
      return null
    } catch (error) {
      console.error('Error saving conversation:', error)
      return null
    }
  }
}

// Export types for frontend
export type BookingAgentResponse = {
  type: 'booking' | 'mental_health_query' | 'general_support' | 'crisis' | 'error'
  message: string
  needsBookingForm?: boolean
  urgency?: 'low' | 'medium' | 'high' | 'crisis'
  conversationId?: string
  error?: string
  requiresImmediateAction?: boolean
}