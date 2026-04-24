import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock3 } from "lucide-react"

export default async function CounselorPendingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/counselor/login")
  }

  if (user.role !== "COUNSELOR") {
    redirect("/dashboard")
  }

  if (user.counselorApprovalStatus === "APPROVED") {
    redirect("/counselor")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-amber-100 p-3 w-fit">
            <Clock3 className="h-8 w-8 text-amber-700" />
          </div>
          <CardTitle>Counselor Approval Pending</CardTitle>
          <CardDescription>
            Your account is verified. An admin must approve your counselor access before you can manage sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground text-center">
          We will unlock your dashboard as soon as approval is completed.
        </CardContent>
      </Card>
    </div>
  )
}
