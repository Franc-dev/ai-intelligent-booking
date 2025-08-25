import { requireAuthPage } from "@/lib/auth-utils"
import { ChatInterface } from "@/components/chat/chat-interface"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Menu } from "lucide-react"
import { redirect } from "next/navigation"

export default async function BookingPage() {
  const user = await requireAuthPage()
  
  // Only regular users can access the booking page
  if (user.role !== "USER") {
    if (user.role === "ADMIN") {
      redirect("/admin/users")
    } else if (user.role === "COUNSELOR") {
      redirect("/counselor")
    }
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-sans font-bold text-lg sm:text-xl">AI Booking Agent</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" className="border-2 border-black text-sm sm:text-base">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-2 border-black text-sm sm:text-base">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-2 border-black">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full border-2 border-black">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="container mx-auto p-3 sm:p-4 h-[calc(100vh-4rem)] flex flex-col" suppressHydrationWarning>
        <div className="flex-1 border-2 border-black shadow-lg bg-card rounded-lg overflow-hidden" suppressHydrationWarning>
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
