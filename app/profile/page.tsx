import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
import { PreferencesForm } from "@/components/profile/preferences-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Role-based access control
  if (user.role === "ADMIN") {
    redirect("/admin/users")
  } else if (user.role === "COUNSELOR") {
    redirect("/counselor")
  }

  // Fetch user preferences and counselors
  const [userPreferences, counselors] = await Promise.all([
    prisma.userPreferences.findUnique({
      where: { userId: user.id },
      include: {
        preferredCounselor: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
    }),
    prisma.counselor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        specialties: true,
        bio: true,
      },
    }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={user.role} userName={user.name} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl mb-2">Profile & Preferences</h1>
          <p className="text-muted-foreground font-sans">Manage your account and personalize your booking experience</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Information */}
          <Card className="border-2 border-black shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {/* Booking Preferences */}
          <Card className="border-2 border-black shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans font-bold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Booking Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PreferencesForm userId={user.id} preferences={userPreferences} counselors={counselors} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
