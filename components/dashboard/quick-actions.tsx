import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, User } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="border-2 border-black shadow-sm">
      <CardHeader>
        <CardTitle className="font-sans font-bold text-lg sm:text-xl">Quick Actions</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground font-sans">Get started with your counseling journey</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Button 
            asChild 
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 border-2 border-black shadow-sm font-sans"
          >
            <Link href="/booking">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans font-semibold text-sm sm:text-base">Book New Session</span>
              <span className="text-xs opacity-90">Schedule a counseling session</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 border-2 border-black shadow-sm font-sans"
          >
            <Link href="/profile">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="font-sans font-semibold text-sm sm:text-base">Profile</span>
              <span className="text-xs text-muted-foreground">Update profile and preferences</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
