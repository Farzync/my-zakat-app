import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getUserByCredentials } from '@/lib/user'

const secretKey = process.env.JWT_SECRET || 'your-secret-key'
const key = new TextEncoder().encode(secretKey)

type UserSession = {
  id: string
  username: string
  name: string
  role: string
}

type SessionPayload = {
  user: UserSession
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload as SessionPayload
}

export async function authenticateUser(username: string, password: string) {
  const user = await getUserByCredentials(username, password)
  if (!user) return null

  const { id, username: uname, name, role } = user
  return { id, username: uname, name, role }
}

export async function createSession(user: UserSession) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
  const session = await encrypt({ user })

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export async function verifySession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value

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
  cookieStore.delete('session')
}
