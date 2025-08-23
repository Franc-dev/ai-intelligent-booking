"use client"

import { format } from "date-fns"
import { Calendar, Clock, Video, User, Copy, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface BookingConfirmationProps {
  booking: {
    id: string
    scheduledAt: Date
    meetingLink: string | null
    meetingId: string | null
    notes: string | null
    counselor: {
      name: string
      email: string
    }
    user: {
      name: string | null
      email: string
    }
    meetingSystemEnabled?: boolean
  }
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const copyMeetingLink = () => {
    if (booking.meetingLink) {
      navigator.clipboard.writeText(booking.meetingLink)
      toast.success("Meeting link copied to clipboard!")
    }
  }

  const openMeetingLink = () => {
    if (booking.meetingLink) {
      window.open(booking.meetingLink, "_blank")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-green-600">Booking Confirmed! 🎉</CardTitle>
        <p className="text-muted-foreground">Your counseling session has been successfully scheduled</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Meeting Details */}
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Counselor</p>
              <p className="text-sm text-muted-foreground">{booking.counselor.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.scheduledAt), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.scheduledAt), "h:mm a")} (1 hour)
              </p>
            </div>
          </div>
        </div>

        {/* Meeting Link Section */}
        {booking.meetingLink ? (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Video Conference</h3>
              <Badge variant="secondary">Video Meeting</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-background rounded border">
                <code className="flex-1 text-sm break-all">{booking.meetingLink}</code>
                <Button size="sm" variant="ghost" onClick={copyMeetingLink} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={openMeetingLink} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
                <Button variant="outline" onClick={copyMeetingLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800">Meeting Room Assignment</h3>
              <Badge variant="outline" className="text-amber-700">Pending</Badge>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-amber-700">
                A meeting room is being assigned to your session. You'll receive an email confirmation with the meeting link shortly.
              </p>
              
              <div className="flex items-center gap-2 text-amber-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Meeting room assignment in progress...</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Session Notes</h3>
            <p className="text-sm text-muted-foreground">{booking.notes}</p>
          </div>
        )}

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please join the meeting 5 minutes early</li>
            <li>• Ensure you have a stable internet connection</li>
            <li>• Test your camera and microphone beforehand</li>
            {booking.meetingLink ? (
              <li>• You'll receive email reminders before the session</li>
            ) : (
              <li>• Check your email for meeting room assignment</li>
            )}
          </ul>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-800">Email Confirmation Sent</h3>
          </div>
          <p className="text-sm text-green-700">
            A confirmation email has been sent to <strong>{booking.user.email}</strong> with all the details for your session.
          </p>
        </div>

        {/* Booking ID */}
        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Booking ID: <code className="bg-muted px-1 rounded">{booking.id}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
