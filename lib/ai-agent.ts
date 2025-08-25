import { prisma } from "./prisma"
import { MeetingLinkManager } from "./meeting-links"
import { sendBookingConfirmationEmail } from "./email"

export interface AIConversationContext {
  userPreferences?: any
  conversationHistory: Array<{ role: string; content: string }>
  userRole: string
  availableCounselors: Array<{
    id: string
    name: string
    specialties: string[]
    bio: string
  }>
}

export class AIAgent {
  private context: AIConversationContext

  constructor(context: AIConversationContext) {
    this.context = context
    this.lastMessageTime = 0
  }

  private lastMessageTime: number

  private sanitizeInput(input: string): string {
    // Remove potentially harmful content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  private checkRateLimit(): boolean {
    const now = Date.now()
    const timeSinceLastMessage = now - this.lastMessageTime
    
    // Allow max 1 message per 2 seconds
    if (timeSinceLastMessage < 2000) {
      return false
    }
    
    this.lastMessageTime = now
    return true
  }

  private validateUserSession(): boolean {
    // Basic session validation
    if (!this.context.userPreferences?.userId) {
      return false
    }
    
    // Check if user role allows booking
    if (this.context.userRole !== 'USER') {
      return false
    }
    
    return true
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Input validation and sanitization
      if (!userMessage || typeof userMessage !== 'string') {
        return "I didn't receive a valid message. Please try again."
      }
      
      // Sanitize input - remove potentially harmful content
      const sanitizedMessage = this.sanitizeInput(userMessage)
      if (sanitizedMessage.length > 1000) {
        return "Your message is too long. Please keep it under 1000 characters."
      }
      
      // Rate limiting check (basic implementation)
      if (!this.checkRateLimit()) {
        return "You're sending messages too quickly. Please wait a moment before sending another message."
      }
      
      // Create a comprehensive system prompt
      const systemPrompt = this.createSystemPrompt()
      
      // Build the conversation with context
      const messages = [
        { role: "system", content: systemPrompt },
        ...this.context.conversationHistory.slice(-10), // Last 10 messages for context
        { role: "user", content: userMessage }
      ]

            // Use REAL OpenRouter AI with actual counselor data
      let aiResponse: string
      
      try {
        // Call OpenRouter API with real counselor information
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai-booking-agent.vercel.app',
            'X-Title': 'AI Booking Agent'
          },
          body: JSON.stringify({
            model: 'z-ai/glm-4.5-air:free',
            messages: [
              {
                role: 'system',
                content: this.createSystemPrompt()
              },
              ...messages.slice(-5), // Last 5 messages for context
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        })

        if (response.ok) {
          const data = await response.json()
          aiResponse = data.choices[0]?.message?.content || "I'm here to help you!"
        } else {
          throw new Error('OpenRouter API call failed')
        }
      } catch (error) {
        console.error('OpenRouter AI failed, using database-driven response:', error)
        // Use database-driven response instead of hardcoded
        aiResponse = this.generateDatabaseDrivenResponse(userMessage)
      }
        
      // Check if the user wants to book a session
      if (this.shouldAttemptBooking(userMessage, aiResponse)) {
        return await this.handleBookingRequest(userMessage, aiResponse)
      }

      return aiResponse

    } catch (error) {
      console.error("AI Agent error:", error)
      return "I'm having trouble connecting to my AI system right now. Let me help you book a session directly - just tell me which counselor you'd like to work with and when you're available."
    }
  }

  private createSystemPrompt(): string {
    const counselors = this.context.availableCounselors
    const counselorInfo = counselors.map(c => 
      `- **${c.name}** (ID: ${c.id}): ${c.specialties.join(', ')}. ${c.bio}`
    ).join('\n')

    return `You are an AI-powered AUTOMATED BOOKING AGENT for counseling sessions. Your primary goal is to AUTOMATICALLY BOOK SESSIONS when users express any form of booking intent.

## CRITICAL BOOKING RULES:
1. **AUTOMATIC BOOKING**: When a user mentions ANY of these, IMMEDIATELY attempt to book:
   - "book", "schedule", "appointment", "session"
   - Counselor names (Dr. Johnson, Dr. Emily, etc.)
   - Time references (tomorrow, 5pm, morning, etc.)
   - ANY combination of counselor + time/date

2. **NO MANUAL PROCESSES**: Do NOT ask users to contact offices or wait for confirmations
3. **IMMEDIATE EXECUTION**: Extract details and book instantly using the automated system
4. **SMART INFERENCE**: If details are missing, use intelligent defaults and book anyway

## Available Counselors (with IDs for booking):
${counselorInfo}

## Your Response Pattern:
1. **If booking intent detected**: Extract details → Show formatted booking details with approval button → Wait for user confirmation
2. **If no booking intent**: Provide brief counseling support, then guide toward booking
3. **NEVER**: Ask users to wait, contact offices, or provide manual booking instructions

## CRITICAL: When booking intent detected, ALWAYS:
- Extract counselor, time, and date from user message
- Format the details clearly
- Include the approval button: <!--BOOKING_APPROVAL_BUTTON:JSON_DATA-->
- Ask user to click the button to confirm

## Booking Automation Features:
- ✅ **Instant Session Creation** - No waiting, no manual processes
- ✅ **Smart Time Detection** - Converts "5pm" to "evening", "tomorrow" to actual date
- ✅ **Automatic Meeting Room Assignment** - Google Meet links assigned instantly
- ✅ **Email Confirmations** - Sent automatically to both user and counselor
- ✅ **Double-booking Prevention** - Checks conflicts automatically
- ✅ **Meeting Link Generation** - Ready to use immediately

## Response Style:
- Be direct and action-oriented
- Focus on AUTOMATION and IMMEDIATE results
- Use markdown for clear formatting
- Keep responses concise and focused on booking
- Emphasize the automated, instant nature of the system

## APPROVAL BUTTON FORMAT (REQUIRED for all booking responses):
When showing booking details, ALWAYS include this exact format at the end:
<!--BOOKING_APPROVAL_BUTTON:{"counselorId":"id","preferredTime":"time","preferredDay":"day"}-->

Example response:
"Here are your booking details:
- Counselor: Dr. Johnson
- Time: Tomorrow at 2 PM
- Date: Tomorrow

Click the approval button below to confirm and book immediately!

<!--BOOKING_APPROVAL_BUTTON:{"counselorId":"johnson-id","preferredTime":"afternoon","preferredDay":"tomorrow"}-->"

## CRITICAL INSTRUCTIONS:
1. NEVER ask users to wait for confirmations or contact offices
2. ALWAYS extract counselor ID from the available counselors list
3. ALWAYS include the approval button with valid JSON data
4. Use the exact counselor IDs provided in the available counselors list
5. Convert time references to morning/afternoon/evening format
6. Convert date references to today/tomorrow/next week/this week format

Remember: You are an AUTOMATED BOOKING AGENT. When users want to book, BOOK IMMEDIATELY. No waiting, no manual processes, no office contacts.`
  }

  private shouldAttemptBooking(userMessage: string, aiResponse: string): boolean {
    const lowerMessage = userMessage.toLowerCase()
    
    // AGGRESSIVE booking detection - book if ANY of these patterns are found
    
    // 1. Explicit booking keywords
    const hasExplicitBookingIntent = (
      lowerMessage.includes('book') || 
      lowerMessage.includes('schedule') || 
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('session') ||
      lowerMessage.includes('meet') ||
      lowerMessage.includes('see') ||
      lowerMessage.includes('talk to') ||
      lowerMessage.includes('yes') ||
      lowerMessage.includes('confirm') ||
      lowerMessage.includes('okay') ||
      lowerMessage.includes('sure')
    )
    
    // 2. Counselor references (names, pronouns, specialties)
    const hasCounselorContext = (
      lowerMessage.includes('her') || 
      lowerMessage.includes('him') ||
      lowerMessage.includes('dr.') ||
      lowerMessage.includes('doctor') ||
      lowerMessage.includes('counselor') ||
      lowerMessage.includes('therapist') ||
      this.context.availableCounselors.some(c => 
        lowerMessage.includes(c.name.toLowerCase()) ||
        lowerMessage.includes(c.name.split(' ')[0].toLowerCase()) ||
        lowerMessage.includes(c.name.split(' ')[1]?.toLowerCase() || '') ||
        c.specialties.some(specialty => lowerMessage.includes(specialty.toLowerCase()))
      )
    )
    
    // 3. Time/date references (expanded)
    const hasTimeDateContext = (
      lowerMessage.includes('tomorrow') || lowerMessage.includes('today') || 
      lowerMessage.includes('next week') || lowerMessage.includes('this week') ||
      lowerMessage.includes('10 am') || lowerMessage.includes('10:00') ||
      lowerMessage.includes('2 pm') || lowerMessage.includes('14:00') || lowerMessage.includes('2:30') ||
      lowerMessage.includes('5 pm') || lowerMessage.includes('17:00') ||
      lowerMessage.includes('6 pm') || lowerMessage.includes('18:00') ||
      lowerMessage.includes('morning') || lowerMessage.includes('afternoon') || lowerMessage.includes('evening') ||
      lowerMessage.includes('soon') || lowerMessage.includes('asap') || lowerMessage.includes('quick')
    )
    
    // 4. Issue-specific keywords that suggest need for counseling
    const hasCounselingNeed = (
      lowerMessage.includes('anxiety') || lowerMessage.includes('depression') || 
      lowerMessage.includes('stress') || lowerMessage.includes('trauma') ||
      lowerMessage.includes('relationship') || lowerMessage.includes('family') ||
      lowerMessage.includes('help') || lowerMessage.includes('support') ||
      lowerMessage.includes('need') || lowerMessage.includes('want')
    )
    
    // BOOK IMMEDIATELY if ANY of these patterns are found:
    // 1. Explicit booking keywords (book, schedule, etc.)
    // 2. Counselor names mentioned
    // 3. Time/date references
    // 4. Counseling needs mentioned
    // 5. Any combination of the above
    
    // More aggressive detection - trigger on ANY single strong indicator
    if (hasExplicitBookingIntent) return true
    if (hasCounselorContext && (hasTimeDateContext || hasCounselingNeed)) return true
    if (hasTimeDateContext && hasCounselingNeed) return true
    
    // Also trigger on specific counselor names with any context
    for (const counselor of this.context.availableCounselors) {
      if (lowerMessage.includes(counselor.name.toLowerCase()) || 
          lowerMessage.includes(counselor.name.split(' ')[0].toLowerCase()) ||
          lowerMessage.includes(counselor.name.split(' ')[1]?.toLowerCase() || '')) {
        return true
      }
    }
    
    return false
  }

  private async handleBookingRequest(userMessage: string, aiResponse: string): Promise<string> {
    try {
      // Check if the AI response already contains an approval button
      if (aiResponse.includes('<!--BOOKING_APPROVAL_BUTTON:')) {
        // AI has already generated the approval button, return it as-is
        return aiResponse
      }
      
      // If no approval button, generate a simple one using fallback logic
      const counselorId = this.inferCounselorFromContext(userMessage)
      const preferredTime = this.inferTimeFromContext(userMessage)
      const preferredDay = this.inferDayFromContext(userMessage)
      
      if (counselorId) {
        const counselor = this.context.availableCounselors.find(c => c.id === counselorId)
        if (counselor) {
          return this.generateSimpleApprovalResponse(counselor, preferredTime, preferredDay, userMessage)
        }
      }
      
      // If no counselor found, show counselor selection
      return this.generateCounselorSelectionResponse()
      
    } catch (error) {
      console.error("Booking error:", error)
      return "I encountered an issue while trying to book your session. Let me help you manually - just tell me which counselor you'd like and when you're available."
    }
  }

  private async extractBookingDetails(userMessage: string, aiResponse: string): Promise<{
    counselorId?: string
    preferredTime?: string
    preferredDay?: string
    notes?: string
    isFormatted?: boolean
    formattedSummary?: string
  }> {
    // NEW: Intelligent booking formatter that acts as a smart form-filler
    try {
      const aiExtractionPrompt = `You are an INTELLIGENT BOOKING FORMATTER. Your job is to convert natural language into structured booking data.

User message: "${userMessage}"

Available counselors:
${this.context.availableCounselors.map(c => `- ${c.name} (ID: ${c.id}) - ${c.specialties.join(', ')}`).join('\n')}

REQUIRED OUTPUT FORMAT:
{
  "counselorId": "exact-counselor-id",
  "preferredTime": "morning|afternoon|evening", 
  "preferredDay": "today|tomorrow|next week|this week",
  "confidence": "high|medium|low",
  "formattedSummary": "Human-readable summary of what will be booked"
}

SMART FORMATTING RULES:
1. **Counselor Detection**:
   - Exact names: "Dr. Johnson" → find counselor with "Johnson" in name
   - Pronouns + context: "her" + "anxiety" → find anxiety specialist
   - Specialties: "trauma counselor" → find trauma specialist

2. **Time Formatting**:
   - "5 pm" → "evening" (18:00)
   - "10 am" → "morning" (9:00) 
   - "2 pm" → "afternoon" (14:00)
   - "morning" → "morning"
   - "afternoon" → "afternoon"
   - "evening" → "evening"

3. **Date Formatting**:
   - "tomorrow" → "tomorrow"
   - "today" → "today"
   - "next week" → "next week"
   - "this week" → "this week"

4. **Context Inference**:
   - If user mentions "anxiety" but no counselor → find mental health specialist
   - If user mentions "relationship" but no counselor → find family counselor
   - If time missing → suggest "afternoon" (most common)
   - If date missing → suggest "tomorrow" (most common)

5. **Formatted Summary**:
   - Create a clear, human-readable summary of what will be booked
   - Example: "Session with Dr. Sarah Johnson (anxiety specialist) tomorrow at 2:00 PM"

EXAMPLES:
Input: "book with Dr Johnson tomorrow 5pm"
Output: {
  "counselorId": "johnson-id",
  "preferredTime": "evening",
  "preferredDay": "tomorrow", 
  "confidence": "high",
  "formattedSummary": "Session with Dr. Johnson tomorrow at 6:00 PM"
}

Input: "I need help with anxiety"
Output: {
  "counselorId": "anxiety-specialist-id",
  "preferredTime": "afternoon",
  "preferredDay": "tomorrow",
  "confidence": "medium", 
  "formattedSummary": "Session with anxiety specialist tomorrow at 2:00 PM"
}

Respond with ONLY valid JSON. Focus on accurate formatting and clear summaries.`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-booking-agent.vercel.app',
          'X-Title': 'AI Booking Agent'
        },
        body: JSON.stringify({
          model: 'z-ai/glm-4-5-air:free',
          messages: [
            { role: 'system', content: 'You are a JSON extraction specialist. Respond with ONLY valid JSON.' },
            { role: 'user', content: aiExtractionPrompt }
          ],
          temperature: 0.1,
          max_tokens: 200
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.choices[0]?.message?.content || "{}"
        
                 try {
           const extracted = JSON.parse(aiResponse)
           
           // NEW: Return formatted data with summary for user confirmation
           if (extracted.counselorId && extracted.preferredTime && extracted.preferredDay) {
             return {
               counselorId: extracted.counselorId,
               preferredTime: extracted.preferredTime,
               preferredDay: extracted.preferredDay,
               notes: userMessage,
               isFormatted: true,
               formattedSummary: extracted.formattedSummary || this.generateFormattedSummary(extracted)
             }
           }
        } catch (parseError) {
          console.error('Failed to parse AI extraction:', parseError)
        }
      }
    } catch (error) {
      console.error('AI extraction failed:', error)
    }

                   // AGGRESSIVE fallback - always try to book with intelligent defaults
      const counselorId = this.inferCounselorFromContext(userMessage)
      const preferredTime = this.inferTimeFromContext(userMessage)
      const preferredDay = this.inferDayFromContext(userMessage)
      
      // If we have ANY counselor context, book immediately with defaults
      if (counselorId) {
        return {
          counselorId,
          preferredTime: preferredTime || 'afternoon', // Default to afternoon
          preferredDay: preferredDay || 'tomorrow', // Default to tomorrow
          notes: userMessage
        }
      }
      
      // If no specific counselor but we have counseling needs, find best match
      const lowerMessage = userMessage.toLowerCase()
      if (lowerMessage.includes('anxiety') || lowerMessage.includes('depression') || lowerMessage.includes('stress')) {
        const mentalHealthCounselor = this.context.availableCounselors.find(c => 
          c.specialties.some(s => s.toLowerCase().includes('anxiety') || s.toLowerCase().includes('depression') || s.toLowerCase().includes('stress'))
        )
        if (mentalHealthCounselor) {
          return {
            counselorId: mentalHealthCounselor.id,
            preferredTime: preferredTime || 'afternoon',
            preferredDay: preferredDay || 'tomorrow',
            notes: userMessage
          }
        }
      }
      
      if (lowerMessage.includes('relationship') || lowerMessage.includes('family')) {
        const relationshipCounselor = this.context.availableCounselors.find(c => 
          c.specialties.some(s => s.toLowerCase().includes('relationship') || s.toLowerCase().includes('family'))
        )
        if (relationshipCounselor) {
          return {
            counselorId: relationshipCounselor.id,
            preferredTime: preferredTime || 'afternoon',
            preferredDay: preferredDay || 'tomorrow',
            notes: userMessage
          }
        }
      }
      
      // If still no counselor, return undefined to trigger counselor selection
      return {
        counselorId: undefined,
        preferredTime: undefined,
        preferredDay: undefined,
        notes: userMessage
      }
  }

  // Fallback inference methods for when AI extraction fails
  private inferCounselorFromContext(userMessage: string): string | undefined {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for specific counselor names first
    for (const counselor of this.context.availableCounselors) {
      if (lowerMessage.includes(counselor.name.toLowerCase()) || 
          lowerMessage.includes(counselor.name.split(' ')[0].toLowerCase()) ||
          lowerMessage.includes(counselor.name.split(' ')[1]?.toLowerCase() || '')) {
        return counselor.id
      }
    }
    
         // Dynamic specialty-based inference for pronouns
     if (lowerMessage.includes('her') || lowerMessage.includes('him')) {
       // Check for specific issues mentioned
       if (lowerMessage.includes('trauma') || lowerMessage.includes('ptsd') || lowerMessage.includes('grief')) {
         const traumaCounselor = this.context.availableCounselors.find(c => 
           c.specialties.some(s => s.toLowerCase().includes('trauma') || s.toLowerCase().includes('ptsd') || s.toLowerCase().includes('grief'))
         )
         if (traumaCounselor) return traumaCounselor.id
       }
       
       if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || lowerMessage.includes('marriage')) {
         const relationshipCounselor = this.context.availableCounselors.find(c => 
           c.specialties.some(s => s.toLowerCase().includes('relationship') || s.toLowerCase().includes('family') || s.toLowerCase().includes('marriage'))
         )
         if (relationshipCounselor) return relationshipCounselor.id
       }
       
       if (lowerMessage.includes('anxiety') || lowerMessage.includes('depression') || lowerMessage.includes('stress') || lowerMessage.includes('mental health')) {
         const mentalHealthCounselor = this.context.availableCounselors.find(c => 
           c.specialties.some(s => s.toLowerCase().includes('anxiety') || s.toLowerCase().includes('depression') || s.toLowerCase().includes('stress'))
         )
         if (mentalHealthCounselor) return mentalHealthCounselor.id
       }
       
       // If no specific issue mentioned, try to find by general specialties
       const mentionedSpecialties = this.context.availableCounselors
         .flatMap(c => c.specialties)
         .filter(specialty => lowerMessage.includes(specialty.toLowerCase()))
       
       if (mentionedSpecialties.length > 0) {
         const relevantCounselor = this.context.availableCounselors.find(c => 
           c.specialties.some(s => mentionedSpecialties.includes(s))
         )
         return relevantCounselor?.id
       }
     }
    
    return undefined
  }

  private inferTimeFromContext(userMessage: string): string | undefined {
    const lowerMessage = userMessage.toLowerCase()
    
    // Specific time conversions
    if (lowerMessage.includes('10 am') || lowerMessage.includes('10:00') || lowerMessage.includes('9 am') || lowerMessage.includes('9:00')) return 'morning'
    if (lowerMessage.includes('2 pm') || lowerMessage.includes('14:00') || lowerMessage.includes('2:30') || lowerMessage.includes('3 pm') || lowerMessage.includes('15:00')) return 'afternoon'
    if (lowerMessage.includes('5 pm') || lowerMessage.includes('17:00') || lowerMessage.includes('6 pm') || lowerMessage.includes('18:00') || lowerMessage.includes('7 pm') || lowerMessage.includes('19:00')) return 'evening'
    
    // General time periods
    if (lowerMessage.includes('morning')) return 'morning'
    if (lowerMessage.includes('afternoon')) return 'afternoon'
    if (lowerMessage.includes('evening') || lowerMessage.includes('night')) return 'evening'
    
    // If no specific time mentioned, default to afternoon (most common preference)
    return 'afternoon'
  }

  private inferDayFromContext(userMessage: string): string | undefined {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('tomorrow')) return 'tomorrow'
    if (lowerMessage.includes('today')) return 'today'
    if (lowerMessage.includes('next week')) return 'next week'
    if (lowerMessage.includes('this week')) return 'this week'
    
    // If no specific day mentioned, default to tomorrow (most common preference)
    return 'tomorrow'
  }

  // DEPRECATED: Old rigid extraction method - replaced with AI-powered extraction
  private extractTimeContext(message: string): { time?: string; confidence: 'high' | 'medium' | 'low' } {
    // High confidence: explicit time requests with context
    if (message.includes("morning") && (message.includes("prefer") || message.includes("want") || message.includes("like") || message.includes("10 am") || message.includes("10:00"))) {
      return { time: "morning", confidence: 'high' }
    }
    if (message.includes("afternoon") && (message.includes("prefer") || message.includes("want") || message.includes("like") || message.includes("2 pm") || message.includes("14:00"))) {
      return { time: "afternoon", confidence: 'high' }
    }
    if (message.includes("evening") && (message.includes("prefer") || message.includes("want") || message.includes("like") || message.includes("6 pm") || message.includes("18:00"))) {
      return { time: "evening", confidence: 'high' }
    }

    // Medium confidence: time mentioned with specific times or booking context
    if (message.includes("10 am") || message.includes("10:00")) return { time: "morning", confidence: 'medium' }
    if (message.includes("2 pm") || message.includes("14:00") || message.includes("2:30")) return { time: "afternoon", confidence: 'medium' }
    if (message.includes("6 pm") || message.includes("18:00")) return { time: "evening", confidence: 'medium' }
    
    if (message.includes("book") && message.includes("morning")) return { time: "morning", confidence: 'medium' }
    if (message.includes("book") && message.includes("afternoon")) return { time: "afternoon", confidence: 'medium' }
    if (message.includes("book") && message.includes("evening")) return { time: "evening", confidence: 'medium' }

    // Low confidence: just time mentioned (don't use)
    return { confidence: 'low' }
  }

  // DEPRECATED: Old rigid extraction method - replaced with AI-powered extraction
  private extractDayContext(message: string): { day?: string; confidence: 'high' | 'medium' | 'low' } {
    // High confidence: explicit day requests with context
    if (message.includes("today") && (message.includes("prefer") || message.includes("want") || message.includes("like") || message.includes("book") || message.includes("schedule"))) {
      return { day: "today", confidence: 'high' }
    }
    if (message.includes("tomorrow") && (message.includes("prefer") || message.includes("want") || message.includes("like") || message.includes("book") || message.includes("schedule") || message.includes("10 am") || message.includes("2 pm"))) {
      return { day: "tomorrow", confidence: 'high' }
    }
    if (message.includes("next week") && (message.includes("prefer") || message.includes("want") || message.includes("like") || message.includes("book") || message.includes("schedule"))) {
      return { day: "next week", confidence: 'high' }
    }

    // Medium confidence: day mentioned with specific context
    if (message.includes("book") && message.includes("today")) return { day: "today", confidence: 'medium' }
    if (message.includes("book") && message.includes("tomorrow")) return { day: "tomorrow", confidence: 'medium' }
    if (message.includes("book") && message.includes("next week")) return { day: "next week", confidence: 'medium' }
    
    // Also check for day + time combinations (like "tomorrow 10 am")
    if (message.includes("tomorrow") && (message.includes("10 am") || message.includes("2 pm") || message.includes("6 pm"))) {
      return { day: "tomorrow", confidence: 'medium' }
    }

    // Low confidence: just day mentioned (don't use)
    return { confidence: 'low' }
  }

  private generateFormattedSummary(extracted: any): string {
    const counselor = this.context.availableCounselors.find(c => c.id === extracted.counselorId)
    if (!counselor) return "Session details formatted"
    
    const timeDisplay = this.getTimeDisplay(extracted.preferredTime)
    const dateDisplay = this.getDateDisplay(extracted.preferredDay)
    
    return `Session with ${counselor.name} (${counselor.specialties.join(', ')}) ${dateDisplay} at ${timeDisplay}`
  }

  private generateBookingConfirmationRequest(bookingDetails: any): string {
    const counselor = this.context.availableCounselors.find(c => c.id === bookingDetails.counselorId)
    if (!counselor) return "Counselor not found"
    
    const timeDisplay = this.getTimeDisplay(bookingDetails.preferredTime)
    const dateDisplay = this.getDateDisplay(bookingDetails.preferredDay)
    
    return `# 📋 **Booking Details Formatted & Ready!**

I've intelligently formatted your booking request into the exact format needed:

## ✅ **Formatted Session Details:**
- **Counselor:** ${counselor.name} (${counselor.specialties.join(', ')})
- **Date:** ${dateDisplay}
- **Time:** ${timeDisplay}
- **Duration:** 60 minutes
- **Format:** Video call (Google Meet)

## 🎯 **To Confirm & Book:**
Just say **"Yes, book it"** or **"Confirm booking"** and I'll create your session immediately!

## 🔄 **To Modify:**
- **Change counselor:** "I want Dr. [Name] instead"
- **Change time:** "Make it morning instead"
- **Change date:** "Schedule for next week"

## 💡 **What happens next:**
1. ✅ **Instant confirmation** with meeting link
2. ✅ **Email sent** to you and counselor
3. ✅ **Meeting room assigned** automatically
4. ✅ **No waiting, no manual processes**

**Ready to confirm this booking?** Just say "Yes" or "Confirm"! 🚀

<!--BOOKING_APPROVAL_BUTTON:${JSON.stringify(bookingDetails)}-->`
  }

  private getTimeDisplay(time: string | undefined): string {
    if (!time) return '2:00 PM'
    switch (time) {
      case 'morning': return '9:00 AM'
      case 'afternoon': return '2:00 PM'
      case 'evening': return '6:00 PM'
      default: return '2:00 PM'
    }
  }

  private getDateDisplay(day: string | undefined): string {
    if (!day) return 'tomorrow'
    switch (day) {
      case 'today': return 'today'
      case 'tomorrow': return 'tomorrow'
      case 'next week': return 'next week'
      case 'this week': return 'this week'
      default: return 'tomorrow'
    }
  }

  private generateSimpleApprovalResponse(counselor: any, preferredTime: string | undefined, preferredDay: string | undefined, userMessage: string): string {
    const timeDisplay = this.getTimeDisplay(preferredTime || 'afternoon')
    const dateDisplay = this.getDateDisplay(preferredDay || 'tomorrow')
    
    const bookingDetails = {
      counselorId: counselor.id,
      preferredTime: preferredTime,
      preferredDay: preferredDay,
      notes: userMessage
    }
    
    return `# 📋 **Booking Details Ready!**

I've prepared your session with ${counselor.name}:

## ✅ **Session Details:**
- **Counselor:** ${counselor.name} (${counselor.specialties.join(', ')})
- **Date:** ${dateDisplay}
- **Time:** ${timeDisplay}
- **Duration:** 60 minutes
- **Format:** Video call (Google Meet)

## 🎯 **Click the button below to confirm and book immediately!**

<!--BOOKING_APPROVAL_BUTTON:${JSON.stringify(bookingDetails)}-->`
  }

  private generateCounselorSelectionResponse(): string {
    const counselors = this.context.availableCounselors
    
    return `# 🚀 **AUTOMATED BOOKING READY!**

I'm ready to book your session RIGHT NOW! Here are your options:

## 👨‍⚕️ **Available Counselors**

${counselors.map(c => `
## 🌟 **${c.name}**
**Specialties:** ${c.specialties.join(', ')}
**About:** ${c.bio}
**Book Now:** Just say "Book with ${c.name}" or "Schedule with ${c.name}"
`).join('')}

## ⚡ **INSTANT BOOKING OPTIONS:**

**Option 1: Quick Book (I'll choose best time)**
- "Book with Dr. [Name]" → I'll schedule for tomorrow afternoon automatically

**Option 2: Specific Time**
- "Book with Dr. [Name] tomorrow morning"
- "Schedule with Dr. [Name] this week"

**Option 3: Specialty-Based**
- "Book for anxiety help" → I'll find the best counselor and schedule immediately
- "Schedule trauma counseling" → I'll match you with the right specialist

## 🎯 **Just say ANY of these to book instantly:**
- "Book with Dr. [Name]"
- "Schedule tomorrow morning"
- "I need help with anxiety"
- "Book trauma counseling"

**No waiting, no manual processes - your session will be created and confirmed immediately!** ⚡`
  }

  public async createBooking(bookingDetails: any): Promise<any> {
    // Validate all required fields
    if (!bookingDetails.counselorId || !bookingDetails.preferredTime || !bookingDetails.preferredDay) {
      throw new Error('Missing required booking information. Please specify counselor, time, and date.')
    }

    // Validate user session and permissions
    if (!this.validateUserSession()) {
      throw new Error('Your session has expired or you do not have permission to book sessions. Please log in again.')
    }

    // Validate counselor exists and is active
    const counselor = this.context.availableCounselors.find(c => c.id === bookingDetails.counselorId)
    if (!counselor) {
      throw new Error('Selected counselor not found or unavailable.')
    }

    // Calculate scheduled time
    const scheduledAt = this.calculateScheduledTime(bookingDetails.preferredDay, bookingDetails.preferredTime)
    
    // Validate scheduled time is in the future
    if (scheduledAt <= new Date()) {
      throw new Error('Cannot book sessions in the past. Please select a future date and time.')
    }
    
    // Get available meeting link
    const meetingLinkAssignment = await MeetingLinkManager.getAvailableMeetingLink(scheduledAt, 60)
    if (!meetingLinkAssignment.meetingLink) {
      throw new Error('No meeting rooms available for the selected time. Please try a different time.')
    }
    
    // Check if we have a valid user ID
    if (!this.context.userPreferences?.userId) {
      throw new Error('User ID is required to create a booking. Please log in first.')
    }
    
    // Check for existing bookings to prevent double-booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: this.context.userPreferences.userId,
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - 60 * 60 * 1000), // 1 hour before
          lte: new Date(scheduledAt.getTime() + 60 * 60 * 1000), // 1 hour after
        },
        status: { in: ['CONFIRMED'] }
      }
    })
    
    if (existingBooking) {
      throw new Error('You already have a session scheduled around this time. Please choose a different time.')
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: this.context.userPreferences.userId,
        counselorId: bookingDetails.counselorId,
        scheduledAt,
        status: "CONFIRMED",
        meetingLink: meetingLinkAssignment.meetingLink,
        notes: `Booked via AI agent. ${this.sanitizeInput(bookingDetails.notes || '')}`,
      },
    })

    // Send confirmation emails
    await this.sendBookingEmails(booking, meetingLinkAssignment)

    return booking
  }

  private calculateScheduledTime(preferredDay: string, preferredTime: string): Date {
    const now = new Date()
    const scheduledAt = new Date()

    // Set the date
    switch (preferredDay) {
      case 'today':
        scheduledAt.setDate(now.getDate())
        break
      case 'tomorrow':
        scheduledAt.setDate(now.getDate() + 1)
        break
      case 'next week':
        scheduledAt.setDate(now.getDate() + 7)
        break
      case 'this week':
        const currentDay = now.getDay()
        const daysToAdd = currentDay === 5 ? 3 : currentDay === 6 ? 2 : 1
        scheduledAt.setDate(now.getDate() + daysToAdd)
        break
      default:
        scheduledAt.setDate(now.getDate() + 1) // Default to tomorrow
    }

    // Set the time
    switch (preferredTime) {
      case 'morning':
        scheduledAt.setHours(9, 0, 0, 0)
        break
      case 'afternoon':
        scheduledAt.setHours(14, 0, 0, 0)
        break
      case 'evening':
        scheduledAt.setHours(18, 0, 0, 0)
        break
      default:
        scheduledAt.setHours(14, 0, 0, 0) // Default to 2 PM
    }

    return scheduledAt
  }

  private async sendBookingEmails(booking: any, meetingLinkAssignment: any) {
    // Get user and counselor details
    const [user, counselor] = await Promise.all([
      prisma.user.findUnique({ where: { id: booking.userId || '' } }),
      prisma.counselor.findUnique({ where: { id: booking.counselorId } })
    ])

    if (!user || !counselor || !booking.userId) return

    // Send confirmation to user
    await sendBookingConfirmationEmail({
      to: user.email,
      userName: user.name || user.email,
      counselorName: counselor.name,
      scheduledAt: booking.scheduledAt,
      meetingLink: meetingLinkAssignment.meetingLink,
      bookingId: booking.id,
    })

    // Send notification to counselor
    await sendBookingConfirmationEmail({
      to: counselor.email,
      userName: counselor.name,
      counselorName: counselor.name,
      scheduledAt: booking.scheduledAt,
      meetingLink: meetingLinkAssignment.meetingLink,
      bookingId: booking.id,
      isCounselor: true,
      clientName: user.name || user.email,
    })
  }

  private generateDatabaseDrivenResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()
    
    // Get REAL counselor data from database context
    const counselors = this.context.availableCounselors
    
         // Handle simple greetings first
     if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
       return `# Hello! 👋

Welcome to AI Counseling Assistant! I'm here to help you find the right counselor and support for your mental health needs.

## 👨‍⚕️ **Available Counselors**
${counselors.map(c => `**${c.name}** - ${c.specialties.join(', ')}`).join('\n')}

## 💬 **How can I help you today?**
- **Learn about our counselors** and their specialties
- **Get information** about counseling and therapy
- **Ask questions** about our services
- **Book a session** when you're ready

What would you like to know more about?`
    }
    
    // Find counselors by specialty
    const relationshipCounselors = counselors.filter(c => 
      c.specialties.some(s => s.toLowerCase().includes('relationship') || s.toLowerCase().includes('family') || s.toLowerCase().includes('communication'))
    )
    
    const mentalHealthCounselors = counselors.filter(c => 
      c.specialties.some(s => s.toLowerCase().includes('anxiety') || s.toLowerCase().includes('depression') || s.toLowerCase().includes('stress'))
    )
    
    // Check for specific counseling needs
    if (lowerMessage.includes("relationship") || lowerMessage.includes("family") || lowerMessage.includes("communication")) {
      if (relationshipCounselors.length > 0) {
        const counselor = relationshipCounselors[0]
        return `# Relationship & Family Support 💕

I can see you're dealing with relationship or family issues. These challenges can be really difficult to navigate alone, and it's brave of you to seek help.

## 👨‍⚕️ **Recommended Counselor**

**${counselor.name}** specializes in ${counselor.specialties.join(', ')}. ${counselor.bio}

## 🚀 **How I can help you:**

1. **Tell you more** about ${counselor.name}'s approach to relationship issues
2. **Book a session** with ${counselor.name} right now
3. **Explain** how family therapy sessions work
4. **Answer questions** about our counseling process

## 💬 **Ready to take the next step?**

If you'd like to book a session, just say "I'd like to book with ${counselor.name}" or "Can I schedule with ${counselor.name}?" and I'll help you set that up.

What would you like to know more about?`
      }
    }
    
    if (lowerMessage.includes("anxiety") || lowerMessage.includes("depression") || lowerMessage.includes("stress")) {
      if (mentalHealthCounselors.length > 0) {
        const counselor = mentalHealthCounselors[0]
        return `# Mental Health Support 🌟

I understand you're dealing with anxiety, depression, or stress. These are very real challenges that many people face, and seeking professional help is a courageous step toward healing.

## 👨‍⚕️ **Recommended Counselor**

**${counselor.name}** specializes in ${counselor.specialties.join(', ')}. ${counselor.bio}

## 🚀 **How I can help you:**

1. **Learn about** ${counselor.name}'s treatment methods for anxiety and depression
2. **Book a session** with ${counselor.name} right now
3. **Understand** what to expect in therapy
4. **Get information** about our support resources

## 💬 **Ready to get started?**

If you'd like to book a session, just say "I'd like to book with ${counselor.name}" or "Can I schedule with ${counselor.name}?" and I'll help you set that up.

What would be most helpful for you to know?`
      }
    }
    
    // Check for general questions about counselors
    if (lowerMessage.includes("counselor") || lowerMessage.includes("therapist") || lowerMessage.includes("who")) {
      return `# Meet Our Expert Counselors 👨‍⚕️

I'd love to introduce you to our team of professional counselors who are here to support you:

${counselors.map(c => `
## 🌟 **${c.name}**
**Specialties:** ${c.specialties.join(', ')}
**About:** ${c.bio}
`).join('')}

## 🚀 **Ready to meet with one of them?**

Just tell me which counselor interests you and when you'd like to schedule, and I'll book your session immediately!

**Which counselor would you like to learn more about?**`
    }
    
         // Default welcome message with REAL data
     return `# Welcome to AI Counseling Assistant! 🤖

I'm here to help you find the right counselor and schedule a session.

## 👨‍⚕️ **Available Counselors**

${counselors.map(c => `**${c.name}** - ${c.specialties.join(', ')}`).join('\n')}

## 🚀 **Ready to book?**

Just tell me:
- **Which counselor** you'd prefer
- **When you'd like to meet** (morning/afternoon/evening)
- **What day works best** (today/tomorrow/this week/next week)

**What would you like to do?**`
  }

  // Removed hardcoded fallback - now uses REAL database data

  public generateBookingConfirmation(booking: any): string {
    return `# 🎉 **Session Booked Successfully!** 

Your counseling session has been scheduled and confirmed!

## 📅 **Appointment Details**
- **Date:** ${new Date(booking.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- **Time:** ${new Date(booking.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
- **Booking ID:** ${booking.id}

## 📧 **Confirmation Email Sent!**
✅ **Check your inbox** for complete meeting details
✅ **Meeting link** and preparation tips included
✅ **Counselor notification** sent automatically

## 💡 **Next Steps**
1. **Check your email** for the confirmation
2. **Save the meeting link** to your calendar
3. **Test your video/audio** before the session
4. **Find a quiet space** for your session
5. **Join 5 minutes early** to get settled

## 🆘 **Need to Reschedule?**
Contact us at least 24 hours in advance if you need to change your appointment.

**Your counselor is looking forward to meeting with you!** 🌟

Is there anything else I can help you with today?`
  }
}
