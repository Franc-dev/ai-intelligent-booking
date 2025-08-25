import { NextRequest } from "next/server"
import * as jose from "jose"
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface JWTPayload {
  userId: string
  email: string
  role: string
  type: string
  iat: number
  exp: number
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
    const { payload } = await jose.jwtVerify(token, secret)
    
    // Type assertion with proper checking
    if (payload.userId && payload.email && payload.role && payload.type) {
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        type: payload.type as string,
        iat: payload.iat as number,
        exp: payload.exp as number
      }
    }
    
    return null
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = req.cookies.get("auth-token")?.value
    
    if (!token) {
      return null
    }

    return await verifyJWT(token)
  } catch (error) {
    console.error("Failed to get auth user:", error)
    return null
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    return handler(req, user)
  }
}

export function requireRole(allowedRoles: string[]) {
  return (handler: Function) => {
    return async (req: NextRequest) => {
      const user = await getAuthUser(req)
      
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        })
      }

      if (!allowedRoles.includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden - Insufficient permissions" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        })
      }

      return handler(req, user)
    }
  }
}

export function requireUserRole(handler: Function) {
  return requireRole(["USER"])(handler)
}

export function requireCounselorRole(handler: Function) {
  return requireRole(["COUNSELOR"])(handler)
}

export function requireAdminRole(handler: Function) {
  return requireRole(["ADMIN"])(handler)
}

// Additional functions for backward compatibility
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const jwtData = await verifyJWT(token)
  if (!jwtData) return null

  const user = await prisma.user.findUnique({
    where: { id: jwtData.userId },
    include: { preferences: true },
  })

  return user
}

export async function requireAuthPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/user/login")
  }
  return user
}
