import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: { name, email: normalizedEmail, passwordHash },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
