"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader } from "@/components/ui/loader"

interface UserPreferences {
  preferredCounselorId: string | null
  preferredTimeSlots: string[]
  timezone: string
  notificationSettings: {
    emailReminders: boolean
    smsReminders: boolean
  }
}

interface Counselor {
  id: string
  name: string
  specialties: string[]
}

export function PreferencesForm() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredCounselorId: null,
    preferredTimeSlots: [],
    timezone: "UTC",
    notificationSettings: {
      emailReminders: true,
      smsReminders: false,
    },
  })
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
    fetchCounselors()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/preferences")
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
      toast.error("Failed to load preferences")
    } finally {
      setLoading(false)
    }
  }

  const fetchCounselors = async () => {
    try {
      const response = await fetch("/api/counselors")
      if (response.ok) {
        const data = await response.json()
        setCounselors(data)
      }
    } catch (error) {
      console.error("Failed to fetch counselors:", error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        toast.success("Preferences saved successfully!")
      } else {
        toast.error("Failed to save preferences")
      }
    } catch (error) {
      console.error("Failed to save preferences:", error)
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleTimeSlotToggle = (timeSlot: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredTimeSlots: prev.preferredTimeSlots.includes(timeSlot)
        ? prev.preferredTimeSlots.filter((slot) => slot !== timeSlot)
        : [...prev.preferredTimeSlots, timeSlot],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" variant="primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-bold">Booking Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Counselor */}
          <div className="space-y-2">
            <Label htmlFor="counselor" className="font-sans font-medium">
              Preferred Counselor
            </Label>
            <Select
              value={preferences.preferredCounselorId || "none"}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, preferredCounselorId: value === "none" ? null : value }))
              }
            >
              <SelectTrigger className="border-2 border-black shadow-sm font-sans">
                <SelectValue placeholder="Select a preferred counselor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {counselors.map((counselor) => (
                  <SelectItem key={counselor.id} value={counselor.id}>
                    {counselor.name} - {counselor.specialties.join(", ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Time Slots */}
          <div className="space-y-3">
            <Label className="font-sans font-medium">Preferred Time Slots</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["morning", "afternoon", "evening"].map((timeSlot) => (
                <Button
                  key={timeSlot}
                  type="button"
                  variant={preferences.preferredTimeSlots.includes(timeSlot) ? "default" : "outline"}
                  onClick={() => handleTimeSlotToggle(timeSlot)}
                  className="border-2 border-black shadow-sm font-sans capitalize"
                >
                  {timeSlot}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              Select your preferred time slots for counseling sessions
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="font-sans font-medium">
              Timezone
            </Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, timezone: value }))
              }
            >
              <SelectTrigger className="border-2 border-black shadow-sm font-sans">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <Label className="font-sans font-medium">Notification Settings</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailReminders"
                  checked={preferences.notificationSettings.emailReminders}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        emailReminders: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="emailReminders" className="font-sans">
                  Email reminders for upcoming sessions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsReminders"
                  checked={preferences.notificationSettings.smsReminders}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        smsReminders: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="smsReminders" className="font-sans">
                  SMS reminders for upcoming sessions
                </Label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full border-2 border-black shadow-sm font-sans font-semibold"
          >
            {saving ? <Loader size="sm" variant="default" /> : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Meeting System Information */}
      <Card className="border-2 border-black shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-bold">Meeting System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="font-sans font-medium text-green-800">Meeting System Active</span>
            </div>
            <p className="text-sm text-green-700 font-sans">
              Your meetings are automatically assigned to available meeting rooms. You'll receive confirmation emails with all the details you need.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
