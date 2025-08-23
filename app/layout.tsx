import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Space_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "AI Booking Agent - Schedule with Expert Counselors",
  description: "AI-powered booking system for scheduling meetings with expert counselors",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceMono.variable} antialiased`} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          dmSans.variable,
          spaceMono.variable
        )}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  )
}
