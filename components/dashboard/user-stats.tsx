import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, TrendingUp, Users, Activity } from "lucide-react"

interface UserStatsProps {
  totalBookings: number
  upcomingCount: number
  completedCount: number
}

export function UserStats({ totalBookings, upcomingCount, completedCount }: UserStatsProps) {
  const thisMonth = Math.min(upcomingCount + completedCount, totalBookings)
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="font-sans font-bold text-xl sm:text-2xl mb-2">Your Counseling Journey</h2>
        <p className="text-muted-foreground font-sans text-sm sm:text-base">Track your progress and upcoming sessions</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Sessions */}
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

        {/* Upcoming Sessions */}
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

        {/* Completed Sessions */}
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

        {/* This Month */}
        <Card className="border-2 border-black shadow-sm hover:shadow-md transition-all duration-200 group sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-sans font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-sans font-bold text-orange-600 mb-1">{thisMonth}</div>
            <p className="text-xs text-muted-foreground font-sans">Current month activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
