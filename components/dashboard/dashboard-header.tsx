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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-black">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-xl">AI Booking Dashboard</h1>
              <p className="text-sm text-muted-foreground font-sans">Welcome back, {user.name || user.email}</p>
            </div>
          </div>

          {/* Center - Meeting System Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="font-sans font-medium text-green-800">Meeting System Active</span>
              {meetingSystemStatus === 'loading' && (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-2 border-border rounded-lg">
              <Avatar className="w-8 h-8 border-2 border-border">
                <AvatarFallback className="bg-primary text-primary-foreground font-sans font-semibold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-sans font-medium text-sm">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-2 border-border shadow-sm font-sans">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm" 
                className="border-2 border-border shadow-sm font-sans hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
