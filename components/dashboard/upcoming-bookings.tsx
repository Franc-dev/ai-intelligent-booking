import { format } from "date-fns"
import { Calendar, Clock, Video, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpcomingBookingsProps {
  bookings: Array<{
    id: string
    scheduledAt: Date
    meetingLink: string | null
    status: string
    notes: string | null
    counselor: {
      name: string
      specialties: string[]
    }
  }>
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  if (bookings.length === 0) {
    return (
      <Card className="border-2 border-black shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-sans text-muted-foreground mb-4">No upcoming sessions scheduled</p>
            <Button asChild className="border-2 border-black shadow-sm font-sans">
              <a href="/booking">Schedule a Session</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-black shadow-sm">
      <CardHeader>
        <CardTitle className="font-sans font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Sessions ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border-2 border-black p-4 bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-sans font-semibold">{booking.counselor.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {booking.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(booking.scheduledAt), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(booking.scheduledAt), "h:mm a")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {booking.counselor.specialties.slice(0, 2).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {booking.meetingLink && (
                <Button size="sm" className="border-2 border-black shadow-sm font-sans" asChild>
                  <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Video className="w-4 h-4 mr-2" />
                    Join
                  </a>
                </Button>
              )}
            </div>

            {booking.notes && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 border border-border">
                <strong>Notes:</strong> {booking.notes}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
