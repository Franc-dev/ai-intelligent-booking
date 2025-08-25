import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Shield, UserCheck } from "lucide-react"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is an admin
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Get all users with their roles
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const roleStats = {
    USER: users.filter(u => u.role === "USER").length,
    COUNSELOR: users.filter(u => u.role === "COUNSELOR").length,
    ADMIN: users.filter(u => u.role === "ADMIN").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={user.role} userName={user.name} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl mb-2">User Management</h1>
          <p className="text-muted-foreground font-sans">
            Manage all users in the system and their roles
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <User className="h-4 w-4" />
                Regular Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{roleStats.USER}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Counselors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{roleStats.COUNSELOR}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-sans flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{roleStats.ADMIN}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="font-sans font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((userItem) => (
                <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-medium">
                        {userItem.name || "No Name"}
                      </span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {userItem.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Joined: {userItem.createdAt.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{userItem._count.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        userItem.role === "ADMIN" ? "destructive" :
                        userItem.role === "COUNSELOR" ? "default" : "secondary"
                      } 
                      className="font-sans"
                    >
                      {userItem.role === "ADMIN" && <Shield className="h-3 w-3 mr-1" />}
                      {userItem.role === "COUNSELOR" && <UserCheck className="h-3 w-3 mr-1" />}
                      {userItem.role === "USER" && <User className="h-3 w-3 mr-1" />}
                      {userItem.role}
                    </Badge>
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
