"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignup) {
        // Handle signup
        const response = await fetch("/api/admin/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.error === "User with this email already exists") {
            toast.error("User with this email already exists")
          } else {
            toast.error(data.error || "Signup failed")
          }
          return
        }

        toast.success("Account created! Check your email for the magic link.")
        setEmail("")
        setName("")
        setIsSignup(false)
      } else {
        // Handle login
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || "Login failed")
          return
        }

        toast.success("Magic link sent! Check your email.")
        setEmail("")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {isSignup ? "Admin Access" : "Admin Sign In"}
        </CardTitle>
        <CardDescription>
          {isSignup 
            ? "Create your administrator account"
            : "Access the admin dashboard"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignup}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignup ? "Creating Account..." : "Sending Magic Link..."}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {isSignup ? "Create Account" : "Send Magic Link"}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-sm text-red-600 hover:text-red-500 underline"
            disabled={isLoading}
          >
            {isSignup 
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
