import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { getUserByCredentials } from "@/lib/user"

const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export async function authenticateUser(username: string, password: string) {
  const user = await getUserByCredentials(username, password)
  if (!user) return null

  const { id, username: uname, name, role } = user
  return { id, username: uname, name, role }
}

export async function createSession(user: {
  id: string
  username: string
  name: string
  role: string
}) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
  const session = await encrypt({ user }) // simple!

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function verifySession(): Promise<{
  id: string
  username: string
  name: string
  role: string
} | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value

  if (!cookie) return null

  try {
    const session = await decrypt(cookie)
    return session.user
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
