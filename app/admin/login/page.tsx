import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminLoginForm } from "@/components/auth/admin-login-form"
import { ArrowLeft, Shield } from "lucide-react"

export default function AdminLoginPage() {
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-sans mb-2">Admin Access</h1>
            <p className="text-muted-foreground font-sans text-sm sm:text-base">
              Sign in to your admin dashboard
            </p>
          </div>
          <AdminLoginForm />
          
          {/* Role Information */}
          <div className="mt-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <h3 className="font-sans font-medium mb-3 text-red-800">Admin Dashboard Features:</h3>
            <div className="space-y-2 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Manage meeting rooms and system status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>User and counselor management</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>System analytics and monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Quality assurance and oversight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
