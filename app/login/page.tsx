import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MagicLoginForm } from "@/components/auth/magic-login-form"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-sans font-bold text-xl">AI Booking Agent</span>
            </Link>

            {/* Back to Home */}
            <Link href="/">
              <Button variant="outline" className="border-2 border-black">
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
            <h1 className="text-4xl font-bold font-sans mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-sans">
              Enter your email to access your dashboard
            </p>
          </div>
          <MagicLoginForm />
          
          {/* Role Information */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-sans font-medium mb-3">Available Roles:</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span><strong>User:</strong> Book sessions and manage appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span><strong>Counselor:</strong> Manage sessions and clients</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span><strong>Admin:</strong> System management and oversight</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
