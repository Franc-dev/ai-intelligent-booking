"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ProfileFormProps {
  user: {
    id: string
    email: string
    name: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-sans font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="border-2 border-black shadow-sm font-sans bg-muted"
        />
        <p className="text-xs text-muted-foreground font-sans">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="font-sans font-medium">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="border-2 border-black shadow-sm font-sans"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full border-2 border-black shadow-sm font-sans font-semibold"
      >
        {isLoading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}
