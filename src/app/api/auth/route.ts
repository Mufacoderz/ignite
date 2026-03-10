import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, getUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (action === 'register') {
    const { name, email, password } = await req.json()
    if (!name || !email || !password)
      return NextResponse.json({ message: 'All fields required.' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json({ message: 'Email already registered.' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    const token = signToken({ id: user.id, name: user.name, email: user.email })

    const res = NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 })
    res.cookies.set('df_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  }

  if (action === 'login') {
    const { email, password } = await req.json()
    if (!email || !password)
      return NextResponse.json({ message: 'All fields required.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 })

    const token = signToken({ id: user.id, name: user.name, email: user.email })
    const res = NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
    res.cookies.set('df_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  }

  if (action === 'logout') {
    const res = NextResponse.json({ message: 'Logged out.' })
    res.cookies.delete('df_token')
    return res
  }

  return NextResponse.json({ message: 'Invalid action.' }, { status: 400 })
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, createdAt: true }
  })
  return NextResponse.json(data)
}
