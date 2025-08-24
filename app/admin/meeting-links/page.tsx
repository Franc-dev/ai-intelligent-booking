import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { MeetingLinksDashboard } from "@/components/admin/meeting-links-dashboard"

export default async function MeetingLinksAdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is an admin
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole={user.role} userName={user.name} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl mb-2">Meeting Links Management</h1>
          <p className="text-muted-foreground font-sans">
            Monitor and manage meeting room assignments and usage
          </p>
        </div>

        <MeetingLinksDashboard />
      </div>
    </div>
  )
}

