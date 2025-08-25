import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserLoginForm } from "@/components/auth/user-login-form"
import { ArrowLeft, User } from "lucide-react"

export default function UserLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-sans font-bold text-lg sm:text-xl">AI Booking Agent</span>
            </Link>

            {/* Back to Home */}
            <Link href="/">
              <Button variant="outline" className="border-2 border-black text-sm sm:text-base">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans mb-2">User Access</h1>
            <p className="text-muted-foreground font-sans text-sm sm:text-base">
              Sign in to your account or create a new one
            </p>
          </div>
          <UserLoginForm />
          
          {/* Role Information */}
          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="font-sans font-medium mb-3 text-blue-800">User Dashboard Features:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Book counseling sessions with AI assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Manage your appointments and schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Join video sessions with counselors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Track your counseling journey</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
