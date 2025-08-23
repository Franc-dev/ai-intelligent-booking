import { requireAuth } from "@/lib/auth"
import { ChatInterface } from "@/components/chat/chat-interface"

export default async function BookingPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <div className="container mx-auto p-4 h-screen flex flex-col" suppressHydrationWarning>
        <div className="flex-1 border-2 border-black shadow-lg bg-card rounded-lg overflow-hidden" suppressHydrationWarning>
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
