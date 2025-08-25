"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Email verified successfully! Redirecting...')
          
          // Redirect based on user role
          setTimeout(() => {
            if (data.user.role === 'USER') {
              router.push('/dashboard')
            } else if (data.user.role === 'COUNSELOR') {
              router.push('/counselor')
            } else if (data.user.role === 'ADMIN') {
              router.push('/admin/users')
            } else {
              router.push('/dashboard')
            }
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyToken()
  }, [searchParams, router])

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
            <CardDescription>Please wait while we verify your email</CardDescription>
          </>
        )
      
      case 'success':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Success!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )
      
      case 'error':
        return (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
            <CardDescription>{message}</CardDescription>
            <div className="mt-4">
              <Button onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {renderContent()}
        </CardHeader>
        <CardContent>
          {status === 'verifying' && (
            <div className="text-center text-sm text-muted-foreground">
              This may take a few moments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
