import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { DayOfWeek } from '@prisma/client'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  const existing = await prisma.workoutPlan.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  const { name, description, scheduledDate, dayOfWeek, exerciseIds } = await req.json()
  if (exerciseIds !== undefined) {
    await prisma.planExercise.deleteMany({ where: { planId: id } })
  }
  const plan = await prisma.workoutPlan.update({
    where: { id },
    data: {
      name, description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      dayOfWeek: (dayOfWeek as DayOfWeek) || null,
      exercises: exerciseIds !== undefined ? {
        create: exerciseIds.map((eid: number, i: number) => ({ exerciseId: eid, orderIndex: i }))
      } : undefined
    },
    include: { exercises: { include: { exercise: true } } }
  })
  return NextResponse.json(plan)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  const existing = await prisma.workoutPlan.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  await prisma.workoutPlan.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted.' })
}
