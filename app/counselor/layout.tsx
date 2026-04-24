import { ReactNode } from "react"
import { getCurrentUser } from "@/lib/auth-utils"
import { Navigation } from "@/components/navigation"

export default async function CounselorLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  const showCounselorHeader = user?.role === "COUNSELOR"

  return (
    <div className="min-h-screen bg-background">
      {showCounselorHeader && <Navigation userRole={user.role} userName={user.name} />}
      {children}
    </div>
  )
}
