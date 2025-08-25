import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Settings, User, Plus, Bot, Clock, BookOpen } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="border-2 border-black shadow-sm">
      <CardHeader>
        <CardTitle className="font-sans font-bold text-lg sm:text-xl">Quick Actions</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">Get started with your counseling journey</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Book New Session */}
          <Button 
            asChild 
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 border-2 border-black shadow-sm font-sans bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105 transition-all duration-200"
          >
            <Link href="/booking">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans font-semibold text-sm sm:text-base">Book New Session</span>
              <span className="text-xs opacity-90">Schedule with AI</span>
            </Link>
          </Button>

          {/* AI Assistant */}
          <Button
            asChild
            variant="outline"
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 border-2 border-black shadow-sm font-sans bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 hover:scale-105 transition-all duration-200"
          >
            <Link href="/booking">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-600 text-white rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans font-semibold text-sm sm:text-base">AI Assistant</span>
              <span className="text-xs text-muted-foreground">Chat & Book</span>
            </Link>
          </Button>

          {/* View Profile */}
          <Button
            asChild
            variant="outline"
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 border-2 border-black shadow-sm font-sans bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 hover:scale-105 transition-all duration-200"
          >
            <Link href="/profile">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans font-semibold text-sm sm:text-base">Profile</span>
              <span className="text-xs text-muted-foreground">Manage Account</span>
            </Link>
          </Button>

          {/* Settings */}
          <Button
            asChild
            variant="outline"
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 border-2 border-black shadow-sm font-sans bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 hover:scale-105 transition-all duration-200"
          >
            <Link href="/profile">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans font-semibold text-sm sm:text-base">Settings</span>
              <span className="text-xs text-muted-foreground">Preferences</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
