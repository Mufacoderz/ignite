import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { DayOfWeek } from '@prisma/client'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const plans = await prisma.workoutPlan.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { name, description, scheduledDate, dayOfWeek, exerciseIds } = await req.json()
    if (!name) return NextResponse.json({ message: 'Name required.' }, { status: 400 })
    const plan = await prisma.workoutPlan.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dayOfWeek: (dayOfWeek as DayOfWeek) || null,
        exercises: exerciseIds?.length ? {
          create: exerciseIds.map((id: number, i: number) => ({ exerciseId: id, orderIndex: i }))
        } : undefined
      },
      include: { exercises: { include: { exercise: true } } }
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: 'Server error.', error: e.message }, { status: 500 })
  }
}
