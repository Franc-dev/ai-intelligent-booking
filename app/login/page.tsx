import { MagicLoginForm } from "@/components/auth/magic-login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2">AI Booking Agent</h1>
          <p className="text-muted-foreground font-sans">Schedule meetings with expert counselors</p>
        </div>
        <MagicLoginForm />
      </div>
    </div>
  )
}
