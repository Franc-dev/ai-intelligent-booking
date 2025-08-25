"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  User, 
  Settings, 
  Users, 
  BarChart3,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavigationProps {
  userRole: string
  userName?: string | null
}

export function Navigation({ userRole, userName }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change to ensure it's closed by default
  // and never persists between navigations
  if (typeof window !== 'undefined') {
    // lightweight safeguard without extra imports
    // when pathname changes during client navigation, close menu
    // this runs on each render; cheap boolean compare
    // eslint-disable-next-line no-unused-expressions
    pathname && isMobileMenuOpen && setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const navigationItems = {
    USER: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/booking", label: "Book Session", icon: Calendar },
      { href: "/profile", label: "Profile", icon: User },
    ],
    COUNSELOR: [
      { href: "/counselor", label: "Dashboard", icon: Home },
      { href: "/counselor/sessions", label: "Sessions", icon: Calendar },
      { href: "/counselor/clients", label: "Clients", icon: Users },
      { href: "/profile", label: "Profile", icon: User },
    ],
    ADMIN: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/admin/meeting-links", label: "Meeting Links", icon: BarChart3 },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/counselors", label: "Counselors", icon: Users },
      { href: "/profile", label: "Profile", icon: User },
    ],
  }

  const currentItems = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.USER

  return (
    <nav className="bg-white border-b-2 border-black shadow-sm relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-sans font-bold text-lg sm:text-xl">Booking Agent</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {currentItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "font-sans",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {userName && (
              <span className="text-sm font-sans text-muted-foreground">
                Welcome, {userName}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {userRole}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-2 border-black"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {userName && (
              <span className="text-xs font-sans text-muted-foreground hidden sm:block">
                {userName}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {userRole}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-2 mb-4">
              {currentItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start font-sans",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
            
            {/* Mobile User Actions */}
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full border-2 border-black"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
