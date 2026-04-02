import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'neurodesk-secret-key-change-in-production'
const COOKIE_NAME = 'neurodesk-token'

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET)
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())

  return token
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecretKey())
  return payload as unknown as JWTPayload
}

export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    },
    {} as Record<string, string>
  )

  return cookies[COOKIE_NAME] || null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export { COOKIE_NAME }
