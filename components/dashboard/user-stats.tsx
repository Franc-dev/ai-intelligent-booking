import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, TrendingUp } from "lucide-react"

interface UserStatsProps {
  totalBookings: number
  upcomingCount: number
  completedCount: number
}

export function UserStats({ totalBookings, upcomingCount, completedCount }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-2 border-black shadow-sm hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-sans font-bold text-blue-600 mb-1">{totalBookings}</div>
            <p className="text-xs text-muted-foreground font-sans">All time sessions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-sm hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-sans font-bold text-green-600 mb-1">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground font-sans">Scheduled sessions</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-sm hover:shadow-md transition-all duration-200 group">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-sans font-bold text-purple-600 mb-1">{completedCount}</div>
            <p className="text-xs text-muted-foreground font-sans">Finished sessions</p>
          </CardContent>
        </Card>
    </div>
  )
}
