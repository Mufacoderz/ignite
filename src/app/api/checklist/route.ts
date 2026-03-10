import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const dateStr = new URL(req.url).searchParams.get('date') || new Date().toISOString().split('T')[0]
  const date = new Date(dateStr)
  const items = await prisma.checklistItem.findMany({
    where: { userId: user.id, date },
    include: { exercise: true },
    orderBy: { id: 'asc' }
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { exerciseId, planId, date } = await req.json()
    const targetDate = date ? new Date(date) : new Date(new Date().toISOString().split('T')[0])
    const existing = await prisma.checklistItem.findFirst({
      where: { userId: user.id, exerciseId, date: targetDate }
    })
    if (existing) return NextResponse.json({ message: 'Already in checklist.' }, { status: 409 })
    const item = await prisma.checklistItem.create({
      data: { userId: user.id, exerciseId, planId: planId || null, date: targetDate },
      include: { exercise: true }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: 'Server error.', error: e.message }, { status: 500 })
  }
}
