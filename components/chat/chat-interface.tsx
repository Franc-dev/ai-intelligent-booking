"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { SuggestedPrompts } from "./suggested-prompts"
import { BookingForm } from "@/components/booking/booking-form"
import { Loader } from "@/components/ui/loader"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'agent'
  content: string
  isAgentic?: boolean
  needsBookingForm?: boolean
  type?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  // Quick replies derived from last assistant message (simple heuristic)
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
  const quickReplies = lastAssistant?.content
    ? [
        'Tell me more tips',
        'How do I start?',
        'Can we break this into steps?',
        'Book a session'
      ]
    : ['I feel burnt out', 'I need coping tips', 'Find a counselor']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          conversationHistory: messages,
          context: { showBookingForm: false }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          needsBookingForm: data.needsBookingForm,
          type: data.type
        }
        
        setMessages(prev => [...prev, aiMessage])
        
        // Check if we need to show booking form
        if (data.needsBookingForm) {
          setCurrentMessage(aiMessage)
          setShowBookingForm(true)
        }
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat failed:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleBookingComplete = (bookingData: any) => {
    // Add booking confirmation message
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎉 **Booking Confirmed!**

**Session Details:**
- **Counselor:** ${bookingData.counselorName}
- **Date:** ${new Date(bookingData.scheduledAt).toLocaleDateString()}
- **Time:** ${new Date(bookingData.scheduledAt).toLocaleTimeString()}
- **Duration:** ${bookingData.duration} minutes
- **Meeting Link:** ${bookingData.meetingLink ? 'Will be sent via email' : 'To be provided'}

Your session has been successfully booked! You'll receive a confirmation email with all the details. If you need to make any changes, please contact us at least 24 hours before your session.`
    }
    
    setMessages(prev => [...prev, confirmationMessage])
    setShowBookingForm(false)
    setCurrentMessage(null)
  }

  const handleBookingCancel = () => {
    setShowBookingForm(false)
    setCurrentMessage(null)
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 p-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          )}
        >
          <div className="prose prose-sm max-w-none [--tw-prose-bullets:theme(colors.gray.600)]">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                pre: ({ children }) => <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto">{children}</pre>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* Show booking form trigger if needed */}
          {message.needsBookingForm && !showBookingForm && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                Would you like to book a session now?
              </p>
              <Button
                onClick={() => {
                  setCurrentMessage(message)
                  setShowBookingForm(true)
                }}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                📅 Book Session
              </Button>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Mental Health Assistant</h1>
            <p className="text-sm text-gray-600">I'm here to help with booking sessions and mental health support</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome! 👋</h3>
            <p className="text-gray-600 mb-6">
              I'm your AI mental health assistant. I can help you book counseling sessions, 
              provide mental health information, and offer support. How can I help you today?
            </p>
            <SuggestedPrompts onPromptClick={handlePromptClick} />
          </div>
        )}

        {messages.map(renderMessage)}

        {/* Inline quick-reply row */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4">
            {quickReplies.map((q) => (
              <Button key={q} type="button" variant="outline" size="sm" onClick={() => setInput(q)}>
                {q}
              </Button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Booking Form Overlay */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <BookingForm
              onBook={handleBookingComplete}
              onCancel={handleBookingCancel}
              currentMessage={currentMessage}
            />
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Input container with embedded controls */}
          <div className="flex items-center gap-2 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1 focus-within:bg-white focus-within:border-gray-300 transition-colors">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 px-1 py-2"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  // submit the surrounding form
                  ;(e.currentTarget.form as HTMLFormElement | null)?.requestSubmit()
                }
              }}
            />

            {/* Auto Think toggle (visual only) */}
            <Button type="button" variant="ghost" className="h-9 gap-1 text-gray-600" title="Auto Think">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Auto Think</span>
            </Button>

            {/* Send */}
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 p-0"
              aria-label="Send"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
