"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, User, Calendar, CheckCircle, Activity } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DashboardHeaderProps {
  user: {
    id: string
    name: string | null
    email: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [meetingSystemStatus, setMeetingSystemStatus] = useState<'active' | 'loading'>('loading')

  useEffect(() => {
    // Check meeting system status
    const checkMeetingSystem = async () => {
      try {
        const response = await fetch("/api/admin/meeting-links/status")
        if (response.ok) {
          setMeetingSystemStatus('active')
        }
      } catch (error) {
        console.error("Failed to check meeting system status:", error)
      }
    }

    checkMeetingSystem()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="border-b-2 border-black bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-sans font-bold text-lg sm:text-xl">AI Booking Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-sans truncate">
                Welcome back, {user.name || user.email}
              </p>
            </div>
          </div>

          {/* Center - Meeting System Status */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="font-sans font-medium text-green-800 text-xs sm:text-sm">Meeting System Active</span>
              {meetingSystemStatus === 'loading' && (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center justify-center lg:justify-end gap-2 sm:gap-3">
            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-muted/50 border-2 border-border rounded-lg">
              <Avatar className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-border flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground font-sans font-semibold text-xs sm:text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block min-w-0">
                <p className="font-sans font-medium text-xs sm:text-sm truncate">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-2 border-border shadow-sm font-sans text-xs sm:text-sm px-2 sm:px-3">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm" 
                className="border-2 border-border shadow-sm font-sans hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm px-2 sm:px-3"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
