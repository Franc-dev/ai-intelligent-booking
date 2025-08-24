"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User, Loader2, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { SuggestedPrompts } from "./suggested-prompts"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import { Loader } from "@/components/ui/loader"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'agent'
  content: string
  toolInvocations?: any[]
  isAgentic?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea when input changes
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [input])

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant" && lastMessage.toolInvocations) {
      const bookingTool = lastMessage.toolInvocations.find(
        (tool: any) => tool.toolName === "createBooking" && tool.result,
      )
      if (bookingTool?.result) {
        setBookingConfirmation(bookingTool.result)
      }
    }
  }, [messages])

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  const renderApprovalButton = (content: string) => {
    // Check if this message contains a booking approval button
    const buttonMatch = content.match(/<!--BOOKING_APPROVAL_BUTTON:(.*?)-->/)
    if (!buttonMatch) return null
    
    try {
      const bookingDetails = JSON.parse(buttonMatch[1])
      
      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 mb-2">Ready to Book?</h4>
              <p className="text-sm text-green-700">
                Click the button below to confirm and create your session immediately.
              </p>
            </div>
            <Button
              onClick={() => handleBookingApproval(bookingDetails)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm"
            >
              ✅ Approve & Book
            </Button>
          </div>
        </div>
      )
    } catch (error) {
      console.error('Failed to parse booking details:', error)
      return null
    }
  }

  const handleBookingApproval = async (bookingDetails: any) => {
    try {
      setIsLoading(true)
      
      // Send approval message to the AI
      const approvalMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Yes, book it'
      }
      
      setMessages(prev => [...prev, approvalMessage])
      
      // Call the chat API to execute the booking
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Yes, book it',
          bookingDetails: bookingDetails
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Add the AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response
        }
        
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('Failed to approve booking')
      }
    } catch (error) {
      console.error('Booking approval failed:', error)
      setError('Failed to approve booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Only show agentic messages for complex requests or actual booking attempts
    const lowerInput = input.toLowerCase()
    const isSimpleGreeting = lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'hey' || lowerInput.length < 10
    const isBookingRequest = lowerInput.includes('book') || lowerInput.includes('schedule') || lowerInput.includes('appointment') || 
                            (lowerInput.includes('tomorrow') && lowerInput.includes('counselor')) || 
                            (lowerInput.includes('next week') && lowerInput.includes('counselor')) || 
                            (lowerInput.includes('morning') && lowerInput.includes('counselor')) || 
                            (lowerInput.includes('afternoon') && lowerInput.includes('counselor')) || 
                            (lowerInput.includes('evening') && lowerInput.includes('counselor'))

    // Only show a single elegant thinking message for complex requests
    if (!isSimpleGreeting && (isBookingRequest || lowerInput.length > 30)) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: 'thinking', 
          role: 'agent' as const, 
          content: '🤖 **AI Agent is processing your request...**', 
          isAgentic: true 
        }])
      }, 300) // Single message with short delay
    }

    if (isBookingRequest) {
      // Add a single, focused booking message
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: 'booking', 
          role: 'agent' as const, 
          content: '🎯 **Processing your booking request...**', 
          isAgentic: true 
        }])
      }, 800) // Shorter delay, single message
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Remove thinking messages
        setMessages(prev => prev.filter(msg => !msg.isAgentic))
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I'm here to help you schedule a session!",
          toolInvocations: data.toolInvocations
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Remove thinking messages
        setMessages(prev => prev.filter(msg => !msg.isAgentic))
        
        // Handle error responses
        let errorMessage = "Failed to get response"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.content || errorMessage
        } catch {
          // If error response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        
        const errorResponseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`
        }
        setMessages(prev => [...prev, errorResponseMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      
      // Remove thinking messages
      setMessages(prev => prev.filter(msg => !msg.isAgentic))
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // If there's an error with the AI chat, show a fallback
  if (error) {
    return (
      <div className="flex flex-col h-full max-w-4xl mx-auto">
        <div className="border-b-2 border-black p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-sans font-bold text-lg">AI Booking Agent</h2>
              <p className="text-sm text-muted-foreground font-sans">Schedule meetings with expert counselors</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-red-100 mx-auto mb-3 flex items-center justify-center border-2 border-red-200 rounded-lg">
            <Bot className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-sans font-bold text-lg text-red-800">AI Service Temporarily Unavailable</h3>
          <p className="text-muted-foreground font-sans max-w-md mx-auto text-sm">
            We're experiencing technical difficulties with our AI assistant. Please try again later or contact support.
          </p>
            <Button 
              onClick={() => setError(null)} 
              className="border-2 border-black shadow-sm font-sans"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto" suppressHydrationWarning>
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-white" suppressHydrationWarning>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center rounded-full shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-sans font-bold text-xl text-gray-900">AI Booking Agent</h2>
            <p className="text-sm text-gray-600 font-sans">Schedule meetings with expert counselors</p>
          </div>
          
          {/* Meeting System Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-full">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="font-sans font-medium text-green-700 text-sm">Meetings Active</span>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-secondary mx-auto mb-3 flex items-center justify-center border-2 border-black">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg mb-1">Welcome to AI Booking</h3>
              <p className="text-muted-foreground font-sans max-w-md mx-auto text-sm">
                I'm here to help you schedule a meeting with one of our expert counselors. Tell me what kind of support
                you're looking for!
              </p>
            </div>
            
            {/* Meeting System Info */}
            <div className="max-w-md mx-auto p-3 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-sans font-medium text-green-800 text-sm">Meeting System Ready</span>
              </div>
              <p className="text-xs text-green-700 font-sans">
                Our AI can automatically assign meeting rooms and send you confirmation emails with all the details you need.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <SuggestedPrompts onPromptClick={handlePromptClick} />
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex w-full",
            message.role === "user" ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "flex gap-3 max-w-4xl w-full",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 mt-1",
                message.role === "user" 
                  ? "bg-blue-500 text-white" 
                  : message.role === "agent"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  : "bg-gray-600 text-white"
              )}>
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : message.role === "agent" ? (
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Container */}
              <div className={cn(
                "flex-1 max-w-3xl",
                message.role === "user" ? "text-right" : "text-left"
              )}>
                <div className={cn(
                  "inline-block rounded-2xl px-4 py-3 shadow-sm",
                  message.role === "user" 
                    ? "bg-blue-500 text-white" 
                    : message.role === "agent"
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
                    : "bg-gray-100 border border-gray-200"
                )}>
                  {message.role === "agent" ? (
                    <div className="flex items-center gap-2 text-purple-700 font-medium">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span className="animate-pulse">{message.content}</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-current">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-current">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-semibold mb-1 text-current">{children}</h3>,
                          p: ({children}) => <p className="mb-2 text-current last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-current">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold text-current">{children}</strong>,
                          em: ({children}) => <em className="italic text-current">{children}</em>,
                          code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                          pre: ({children}) => <pre className="bg-gray-200 p-2 rounded text-sm font-mono overflow-x-auto">{children}</pre>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      
                      {/* Render approval button if present */}
                      {renderApprovalButton(message.content)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {bookingConfirmation && (
          <div className="flex justify-center my-6">
            <BookingConfirmation booking={bookingConfirmation} />
          </div>
        )}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex gap-3 max-w-4xl w-full">
              {/* Avatar */}
              <div className="w-8 h-8 bg-gray-600 text-white flex items-center justify-center rounded-full flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>

              {/* Loading Message */}
              <div className="flex-1 max-w-3xl">
                <div className="inline-block rounded-2xl px-4 py-3 bg-gray-100 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                      <circle cx="4" cy="12" r="2" fill="currentColor"/>
                      <circle cx="12" cy="4" r="2" fill="currentColor"/>
                      <circle cx="20" cy="12" r="2" fill="currentColor"/>
                      <circle cx="12" cy="20" r="2" fill="currentColor"/>
                    </svg>
                    <div className="space-y-1">
                      <div className="font-sans text-sm font-medium text-gray-800">
                        {input.toLowerCase().includes("book") || input.toLowerCase().includes("schedule") || input.toLowerCase().includes("meeting") 
                          ? "Creating your meeting..." 
                          : "Thinking..."}
                      </div>
                      {input.toLowerCase().includes("book") || input.toLowerCase().includes("schedule") || input.toLowerCase().includes("meeting") && (
                        <div className="text-xs text-gray-600 font-sans">
                          Assigning meeting room • Sending confirmation email • Notifying counselor
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Form at Bottom */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here... (Shift+Enter for new line, Enter to send)"
            className="flex-1 border border-gray-300 shadow-sm font-sans resize-none min-h-[44px] max-h-[120px] overflow-y-auto leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-xl"
            style={{ 
              height: 'auto',
              minHeight: '44px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSubmit(e as any);
                }
              }
            }}
            disabled={isLoading}
            rows={1}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm font-sans font-semibold px-6 h-[44px] flex-shrink-0 rounded-xl transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle cx="4" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="4" r="2" fill="currentColor"/>
                  <circle cx="20" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="20" r="2" fill="currentColor"/>
                </svg>
                <span>
                  {input.toLowerCase().includes("book") || input.toLowerCase().includes("schedule") || input.toLowerCase().includes("meeting")
                    ? "Creating Meeting..."
                    : "Thinking..."}
                </span>
              </div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
