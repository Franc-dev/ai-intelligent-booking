import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function createLoginToken(email: string) {
  // Generate a secure random token
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { email },
    })
  }

  // Create login token
  await prisma.loginToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  })

  return { token, user }
}

export async function verifyLoginToken(token: string) {
  const loginToken = await prisma.loginToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!loginToken || loginToken.used || loginToken.expiresAt < new Date()) {
    return null
  }

  // Mark token as used
  await prisma.loginToken.update({
    where: { id: loginToken.id },
    data: { used: true },
  })

  return loginToken.user
}

export async function createJWT(userId: string, role?: string) {
  const jwt = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  return jwt
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      role: payload.role as string
    }
  } catch {
    return null
  }
}

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

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
