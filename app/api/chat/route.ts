import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { assignMeetingRoom } from "@/lib/booking-tools"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
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

    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
      include: {
        preferredCounselor: {
          select: {
            name: true,
            specialties: true,
          },
        },
      },
    })

    // Create messages array with the user's message
    const messages = [
      {
        role: "user" as const,
        content: message,
      }
    ]

    // Store conversation in database
    const conversation = await prisma.aIConversation.create({
      data: {
        userId: user.id,
        messages: messages,
        context: {
          userPreferences,
        },
      },
    })

    // Check if user wants to book a meeting
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes("book") || lowerMessage.includes("schedule") || lowerMessage.includes("appointment") || lowerMessage.includes("meeting") || lowerMessage.includes("right now") || lowerMessage.includes("rightnow")) {
      
      // Try to extract booking details from the message
      let counselorName = ""
      let preferredTime = ""
      let preferredDay = ""
      
      // Check for counselor preferences
      if (lowerMessage.includes("sarah") || lowerMessage.includes("johnson") || lowerMessage.includes("anxiety") || lowerMessage.includes("depression") || lowerMessage.includes("stress")) {
        counselorName = "Dr. Sarah Johnson"
      } else if (lowerMessage.includes("michael") || lowerMessage.includes("chen") || lowerMessage.includes("relationship") || lowerMessage.includes("family") || lowerMessage.includes("communication")) {
        counselorName = "Dr. Michael Chen"
      }

      // Extract time preferences
      if (lowerMessage.includes("morning")) preferredTime = "morning"
      else if (lowerMessage.includes("afternoon")) preferredTime = "afternoon"
      else if (lowerMessage.includes("evening")) preferredTime = "evening"

      // Extract day preferences
      if (lowerMessage.includes("tomorrow")) preferredDay = "tomorrow"
      else if (lowerMessage.includes("next week")) preferredDay = "next week"
      else if (lowerMessage.includes("this week")) preferredDay = "this week"
      else if (lowerMessage.includes("today")) preferredDay = "today"

      // If we have counselor and time, but no day, set a default
      if (counselorName && preferredTime && !preferredDay) {
        preferredDay = "tomorrow" // Default to tomorrow
      }

      // If we have counselor but no time, set a default
      if (counselorName && !preferredTime) {
        preferredTime = "afternoon" // Default to afternoon
      }

      // If we have counselor but no day, set a default
      if (counselorName && !preferredDay) {
        preferredDay = "tomorrow" // Default to tomorrow
      }

      if (counselorName) {
        // We have enough info to book! Let's do it.
        const meetingRoom = await assignMeetingRoom()
        const scheduledAt = new Date()
        
        // Set the date based on preference
        if (preferredDay === "tomorrow") {
          scheduledAt.setDate(scheduledAt.getDate() + 1)
        } else if (preferredDay === "next week") {
          scheduledAt.setDate(scheduledAt.getDate() + 7)
        } else if (preferredDay === "this week") {
          // Find next available day this week
          const currentDay = scheduledAt.getDay()
          const daysToAdd = currentDay === 5 ? 3 : currentDay === 6 ? 2 : 1
          scheduledAt.setDate(scheduledAt.getDate() + daysToAdd)
        }
        
        // Set the time based on preference
        if (preferredTime === "morning") scheduledAt.setHours(9, 0, 0, 0)
        else if (preferredTime === "afternoon") scheduledAt.setHours(14, 0, 0, 0)
        else if (preferredTime === "evening") scheduledAt.setHours(18, 0, 0, 0)
        else scheduledAt.setHours(14, 0, 0, 0) // Default to 2 PM

        // Find the counselor in database
        const counselor = await prisma.counselor.findFirst({
          where: { name: { contains: counselorName.split(" ")[1] } }
        })

        if (counselor) {
          // Create the booking
          const booking = await prisma.booking.create({
            data: {
              userId: user.id,
              counselorId: counselor.id,
              scheduledAt,
              status: "CONFIRMED",
              meetingLink: meetingRoom.link,
              notes: `Booked via AI chat. User preference: ${preferredTime} on ${preferredDay}`,
            },
          })

          // Send confirmation email to client
          await sendBookingConfirmationEmail({
            to: user.email,
            userName: user.name || user.email,
            counselorName: counselor.name,
            scheduledAt,
            meetingLink: meetingRoom.link,
            bookingId: booking.id,
          })

          // Send notification email to counselor
          await sendBookingConfirmationEmail({
            to: counselor.email,
            userName: counselor.name,
            counselorName: counselor.name,
            scheduledAt,
            meetingLink: meetingRoom.link,
            bookingId: booking.id,
            isCounselor: true,
            clientName: user.name || user.email,
          })

          const responseContent = `# 🎉 Meeting Booked Successfully!

Your session has been scheduled with **${counselor.name}**!

## 📅 Appointment Details
- **Date:** ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- **Time:** ${scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
- **Meeting Room:** ${meetingRoom.id}
- **Booking ID:** ${booking.id}

## 🔗 Join Your Session
Click this link to join your video session: **${meetingRoom.link}**

## 📧 **Meeting Details Sent to Your Email!**
✅ **Confirmation email sent to:** ${user.email}
✅ **Check your inbox** for complete meeting details
✅ **Save the email** for easy access to your meeting link

## 📋 What's in your email:
- **Complete meeting details** and confirmation
- **Pre-session preparation tips** and guidelines
- **What to expect** in your first session
- **Meeting link** ready to click
- **Rescheduling information** if needed

## 💡 Next Steps
1. **Check your email** (${user.email}) for the confirmation
2. **Save the meeting link** to your calendar
3. **Test your video/audio** before the session
4. **Find a quiet space** for your session
5. **Join 5 minutes early** to get settled

Your counselor is looking forward to meeting with you! If you need to reschedule, please contact us at least 24 hours in advance.

**💌 Haven't received the email? Check your spam folder or contact support.**`

          // Update conversation with booking response
          await prisma.aIConversation.update({
            where: { id: conversation.id },
            data: {
              messages: [
                ...messages,
                {
                  role: "assistant",
                  content: responseContent,
                },
              ],
            },
          })

          return new Response(JSON.stringify({ 
            content: responseContent,
            conversationId: conversation.id,
            booking: {
              id: booking.id,
              scheduledAt,
              counselorName: counselor.name,
              meetingLink: meetingRoom.link,
            }
          }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
          })
        }
      }

      // If we don't have a counselor, ask for that first
      if (!counselorName) {
        const responseContent = `# Let's Book Your Session Right Now!

I'm ready to schedule your meeting! I just need to know which counselor you'd prefer.

## 🤔 Quick Question:

**Dr. Sarah Johnson** - Anxiety, Depression, Stress Management
**Dr. Michael Chen** - Relationships, Family, Communication Skills

## 💬 Just tell me:
"I want Dr. Sarah Johnson" or "Book me with Dr. Michael Chen"

Once you pick a counselor, I'll immediately book your session for tomorrow afternoon (or whenever you prefer) and send you the confirmation email!`

        // Update conversation with response
        await prisma.aIConversation.update({
          where: { id: conversation.id },
          data: {
            messages: [
              ...messages,
              {
                role: "assistant",
                content: responseContent,
              },
            ],
          },
        })

        return new Response(JSON.stringify({ 
          content: responseContent,
          conversationId: conversation.id
        }), { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      }
    }

    // Generate a helpful response based on the user's message
    let responseContent = ""
    
    if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
      responseContent = `# I understand you're feeling anxious

I can see you're feeling anxious and need someone to talk to. That's completely normal and seeking help is a brave step.

## Recommended Counselor

**Dr. Sarah Johnson** specializes in anxiety, depression, and stress management. She has extensive experience helping people with anxiety and can provide you with effective coping strategies.

## How I can help you:

1. **Learn more** about Dr. Johnson's approach to anxiety
2. **Book a session** with Dr. Johnson right now
3. **Understand** what to expect in your first session  
4. **Get information** about our booking process

## 🚀 Ready to book?
Just say "I'd like to book with Dr. Sarah Johnson" and I'll schedule your session immediately!

What would be most helpful for you right now?`
    } else if (lowerMessage.includes("relationship") || lowerMessage.includes("family") || lowerMessage.includes("communication")) {
      responseContent = `# Relationship & Family Support

I can see you're dealing with relationship or family issues. These challenges can be really difficult to navigate alone.

## Recommended Counselor

**Dr. Michael Chen** specializes in:
- Relationship counseling
- Family therapy  
- Communication skills
- Conflict resolution

He's helped many families and couples improve their relationships and develop better communication patterns.

## How I can help you:

1. **Tell you more** about Dr. Chen's approach
2. **Book a session** with Dr. Chen right now
3. **Explain** how family therapy sessions work
4. **Answer questions** about our counseling process

## 🚀 Ready to book?
Just say "I'd like to book with Dr. Michael Chen" and I'll schedule your session immediately!

What would you like to know more about?`
    } else if (lowerMessage.includes("depression") || lowerMessage.includes("sad") || lowerMessage.includes("down")) {
      responseContent = `# Depression Support

I hear that you're struggling with depression or feeling down. Please know that you're not alone, and it's okay to ask for help.

## Recommended Counselor

**Dr. Sarah Johnson** has helped many people with depression and can work with you to develop a personalized treatment plan. She combines evidence-based approaches with a compassionate, understanding approach.

## How I can help you:

1. **Learn about** Dr. Johnson's depression treatment methods
2. **Book a session** with Dr. Johnson right now
3. **Understand** what to expect in therapy
4. **Get information** about our support resources

## 🚀 Ready to book?
Just say "I'd like to book with Dr. Sarah Johnson" and I'll schedule your session immediately!

What would be most helpful for you to know?`
    } else {
      // Check if this is a follow-up message and suggest booking
      const conversationCount = await prisma.aIConversation.count({
        where: { userId: user.id }
      })
      
      if (conversationCount > 2) {
        // After a few messages, proactively suggest booking
        responseContent = `# Thanks for chatting with me!

I've enjoyed our conversation and I'm here to help you get the support you need.

## 🚀 Ready to take the next step?

I can help you book a session right now! Just tell me:

**For immediate support:**
"I'd like to book with Dr. Sarah Johnson tomorrow morning"

**For relationship help:**
"I'd like to schedule with Dr. Michael Chen this week"

**Or let me know your preference:**
- Which counselor you'd like to work with
- When you'd like to meet (morning/afternoon/evening)
- What day works best (tomorrow/this week/next week)

## 💡 What happens when you book:
1. **Immediate confirmation** with meeting details
2. **Email confirmation** sent to you
3. **Meeting room assigned** automatically
4. **Counselor notified** about your session

Would you like to book a session now, or do you have other questions?`
      } else {
        responseContent = `# Welcome to AI Booking

Thank you for reaching out. I'm here to help you find the right counselor and schedule a session.

## Available Counselors

### Dr. Sarah Johnson
- **Specialties:** Anxiety, Depression, Stress Management, Career Counseling

### Dr. Michael Chen  
- **Specialties:** Relationship Counseling, Family Therapy, Communication Skills, Conflict Resolution

## 🚀 I can book your session right now!

Just tell me:
- Which counselor you'd prefer
- When you'd like to meet (morning/afternoon/evening)
- What day works best

## 💬 Example:
"I'd like to book with Dr. Sarah Johnson tomorrow morning" or "Can I schedule with Dr. Michael Chen next week?"

Once you give me these details, I'll immediately:
1. **Book your session**
2. **Assign a meeting room**
3. **Send you a confirmation email**
4. **Notify your counselor**

What would you like to do?`
      }
    }

    // Update conversation with AI response
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: {
        messages: [
          ...messages,
          {
            role: "assistant",
            content: responseContent,
          },
        ],
      },
    })

    return new Response(JSON.stringify({ 
      content: responseContent,
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
