import { format } from "date-fns"
import { Calendar, Clock, User, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BookingHistoryProps {
  bookings: Array<{
    id: string
    scheduledAt: Date
    status: string
    notes: string | null
    counselor: {
      name: string
      specialties: string[]
    }
  }>
}

export function BookingHistory({ bookings }: BookingHistoryProps) {
  if (bookings.length === 0) {
    return (
      <Card className="border-2 border-black shadow-sm">
        <CardHeader>
          <CardTitle className="font-sans font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-sans text-muted-foreground">No completed sessions yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-black shadow-sm">
      <CardHeader>
        <CardTitle className="font-sans font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="border border-border p-3 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-sans font-medium text-sm">{booking.counselor.name}</span>
              </div>
              <Badge variant={booking.status === "COMPLETED" ? "default" : "secondary"} className="text-xs">
                {booking.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(booking.scheduledAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(booking.scheduledAt), "h:mm a")}
              </div>
            </div>

            {booking.notes && (
              <p className="text-xs text-muted-foreground bg-background p-2 border border-border">{booking.notes}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
