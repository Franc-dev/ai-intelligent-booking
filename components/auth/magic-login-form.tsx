"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"

export function MagicLoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // For development - show the magic link
        if (data.magicLink) {
          setMagicLink(data.magicLink)
        }
      } else {
        alert(data.error || "Failed to send magic link")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-black">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-none flex items-center justify-center mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <CardTitle className="font-sans text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="font-sans">
            We've sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center font-sans">
            Click the link in your email to sign in. The link will expire in 15 minutes.
          </p>

          {magicLink && (
            <div className="p-4 bg-muted border-2 border-black">
              <p className="text-xs font-mono mb-2">Development Mode - Magic Link:</p>
              <a href={magicLink} className="text-xs font-mono text-primary hover:underline break-all">
                {magicLink}
              </a>
            </div>
          )}

          <Button
            onClick={() => {
              setIsSuccess(false)
              setEmail("")
              setMagicLink(null)
            }}
            variant="outline"
            className="w-full border-2 border-black shadow-sm font-sans font-semibold"
          >
            Send Another Link
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-black">
      <CardHeader className="text-center">
        <CardTitle className="font-sans text-2xl font-bold">Sign In</CardTitle>
        <CardDescription className="font-sans">Enter your email to receive a magic link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-black shadow-sm font-sans"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full shadow-md border-2 border-black font-sans font-semibold"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Magic Link...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
