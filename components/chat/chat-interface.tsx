"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  role: 'user' | 'assistant'
  content: string
  toolInvocations?: any[]
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content || "I'm here to help you schedule a session!",
          toolInvocations: data.toolInvocations
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <div className="w-16 h-16 bg-red-100 mx-auto mb-4 flex items-center justify-center border-2 border-red-200 rounded-lg">
              <Bot className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-sans font-bold text-xl text-red-800">AI Service Temporarily Unavailable</h3>
            <p className="text-muted-foreground font-sans max-w-md mx-auto">
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
      <div className="border-b-2 border-black p-4 bg-card" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-sans font-bold text-lg">AI Booking Agent</h2>
            <p className="text-sm text-muted-foreground font-sans">Schedule meetings with expert counselors</p>
          </div>
          
          {/* Meeting System Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-sans font-medium">Meetings Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-secondary mx-auto mb-4 flex items-center justify-center border-2 border-black">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xl mb-2">Welcome to AI Booking</h3>
              <p className="text-muted-foreground font-sans max-w-md mx-auto">
                I'm here to help you schedule a meeting with one of our expert counselors. Tell me what kind of support
                you're looking for!
              </p>
            </div>
            
            {/* Meeting System Info */}
            <div className="max-w-md mx-auto p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-sans font-medium text-green-800">Meeting System Ready</span>
              </div>
              <p className="text-sm text-green-700 font-sans">
                Our AI can automatically assign meeting rooms and send you confirmation emails with all the details you need.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <SuggestedPrompts onPromptClick={handlePromptClick} />
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <Card
              className={cn(
                "max-w-[80%] border-2 border-black shadow-sm",
                message.role === "user" ? "bg-secondary" : "bg-card",
              )}
            >
              <CardContent className="p-3">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
                      h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-semibold mb-1 text-foreground">{children}</h3>,
                      p: ({children}) => <p className="mb-2 text-foreground">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-foreground">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({children}) => <em className="italic text-foreground">{children}</em>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {message.role === "user" && (
              <div className="w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center border-2 border-black flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {bookingConfirmation && (
          <div className="flex justify-center my-6">
            <BookingConfirmation booking={bookingConfirmation} />
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <Card className="border-2 border-black shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-orange-600" viewBox="0 0 24 24">
                    <circle cx="4" cy="12" r="2" fill="currentColor"/>
                    <circle cx="12" cy="4" r="2" fill="currentColor"/>
                    <circle cx="20" cy="12" r="2" fill="currentColor"/>
                    <circle cx="12" cy="20" r="2" fill="currentColor"/>
                  </svg>
                  <div className="space-y-1">
                    <div className="font-sans text-sm font-medium text-foreground">
                      {input.toLowerCase().includes("book") || input.toLowerCase().includes("schedule") || input.toLowerCase().includes("meeting") 
                        ? "Creating your meeting..." 
                        : "Thinking..."}
                    </div>
                    {input.toLowerCase().includes("book") || input.toLowerCase().includes("schedule") || input.toLowerCase().includes("meeting") && (
                      <div className="text-xs text-muted-foreground font-sans">
                        Assigning meeting room • Sending confirmation email • Notifying counselor
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Form at Bottom */}
      <div className="border-t-2 border-black p-4 bg-card flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Tell me what kind of support you're looking for..."
            className="flex-1 border-2 border-black shadow-sm font-sans"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="border-2 border-black shadow-sm font-sans font-semibold px-4"
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
