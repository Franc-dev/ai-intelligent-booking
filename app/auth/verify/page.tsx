"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("No verification token provided")
      return
    }

    // The verification is handled by the API route
    // This page is just for showing the loading state
    // The API route will redirect to dashboard on success

    fetch(`/api/auth/verify?token=${token}`)
      .then((response) => {
        if (response.redirected) {
          // Successful verification, user will be redirected
          setStatus("success")
          setMessage("Verification successful! Redirecting...")
          window.location.href = response.url
        } else {
          return response.json()
        }
      })
      .then((data) => {
        if (data?.error) {
          setStatus("error")
          setMessage(data.error)
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Verification failed. Please try again.")
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-black">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-none flex items-center justify-center mb-4">
            {status === "loading" && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === "success" && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === "error" && <XCircle className="w-6 h-6 text-red-600" />}
          </div>
          <CardTitle className="font-sans text-2xl font-bold">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Success!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground font-sans">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}
