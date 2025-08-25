import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Calendar, Star, Clock, MapPin } from "lucide-react"

export default async function AdminCounselorsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is an admin
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Get all counselors with their details
  const counselors = await prisma.counselor.findMany({
    include: {
      availability: {
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={user.role} userName={user.name} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl mb-2">Counselor Management</h1>
          <p className="text-muted-foreground font-sans">
            Manage all counselors, their specialties, and availability
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Total Counselors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{counselors.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Active Counselors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {counselors.filter(c => c.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {counselors.reduce((sum, c) => sum + c._count.bookings, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avg. Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {counselors.length > 0 
                  ? Math.round(counselors.reduce((sum, c) => sum + c._count.bookings, 0) / counselors.length)
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Counselors List */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="font-sans font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Counselors ({counselors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {counselors.map((counselor) => (
                <div key={counselor.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans font-bold text-lg">{counselor.name}</h3>
                        <Badge 
                          variant={counselor.isActive ? "default" : "secondary"}
                          className="font-sans"
                        >
                          {counselor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{counselor.email}</span>
                        <span>•</span>
                        <span>{counselor._count.bookings} bookings</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-2 border-black">
                      Edit
                    </Button>
                  </div>

                  {/* Specialties */}
                  {counselor.specialties.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-sans font-medium text-sm mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="font-sans">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {counselor.bio && (
                    <div className="mb-4">
                      <h4 className="font-sans font-medium text-sm mb-2">Bio:</h4>
                      <p className="text-sm text-muted-foreground font-sans">{counselor.bio}</p>
                    </div>
                  )}

                  {/* Availability */}
                  <div>
                    <h4 className="font-sans font-medium text-sm mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Availability:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {counselor.availability.map((avail) => (
                        <div key={avail.id} className="text-xs p-2 border rounded bg-muted/50">
                          <div className="font-sans font-medium">{dayNames[avail.dayOfWeek]}</div>
                          <div className="text-muted-foreground">
                            {avail.startTime} - {avail.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
