import { sql, User } from './db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE_NAME = 'postpilot_session'
const SESSION_DURATION_DAYS = 30

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create a new user
export async function createUser(email: string, password: string, fullName?: string): Promise<User | null> {
  const passwordHash = await hashPassword(password)
  
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName || null})
      RETURNING *
    `
    return result[0] as User
  } catch (error: unknown) {
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return null
    }
    throw error
  }
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}
  `
  return result[0] as User || null
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `
  return result[0] as User || null
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
  
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `
  
  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
  
  return token
}

// Get current session
export async function getSession(): Promise<{ user: User; sessionId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }
  
  const result = await sql`
    SELECT s.id as session_id, u.* 
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `
  
  if (!result[0]) {
    return null
  }
  
  const { session_id, ...user } = result[0]
  return { user: user as User, sessionId: session_id }
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
  }
  
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Require authentication - redirects if not logged in
export async function requireAuth(): Promise<User> {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return session.user
}

// Sign in
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const user = await findUserByEmail(email)
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }
  
  const validPassword = await verifyPassword(password, user.password_hash)
  
  if (!validPassword) {
    return { success: false, error: 'Invalid email or password' }
  }
  
  await createSession(user.id)
  
  return { success: true }
}

// Sign up
export async function signUp(
  email: string, 
  password: string, 
  fullName?: string
): Promise<{ success: boolean; error?: string }> {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' }
  }
  
  // Validate password
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }
  
  const user = await createUser(email, password, fullName)
  
  if (!user) {
    return { success: false, error: 'An account with this email already exists' }
  }
  
  await createSession(user.id)
  
  return { success: true }
}

// Update user
export async function updateUser(userId: string, data: Partial<Pick<User, 'full_name' | 'avatar_url'>>): Promise<User | null> {
  const result = await sql`
    UPDATE users 
    SET 
      full_name = COALESCE(${data.full_name ?? null}, full_name),
      avatar_url = COALESCE(${data.avatar_url ?? null}, avatar_url),
      updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
  return result[0] as User || null
}

// Decrement AI credits
export async function useAICredit(userId: string): Promise<boolean> {
  const result = await sql`
    UPDATE users 
    SET ai_credits = ai_credits - 1
    WHERE id = ${userId} AND ai_credits > 0
    RETURNING ai_credits
  `
  return result.length > 0
}

// Get AI credits
export async function getAICredits(userId: string): Promise<number> {
  const result = await sql`
    SELECT ai_credits FROM users WHERE id = ${userId}
  `
  return result[0]?.ai_credits ?? 0
}
