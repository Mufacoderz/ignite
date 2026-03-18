import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { Category } from '@prisma/client'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const exercises = await prisma.exercise.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(exercises)
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { name, muscleGroup, category, sets, reps, notes } = await req.json()
    if (!name) return NextResponse.json({ message: 'Name required.' }, { status: 400 })
    const exercise = await prisma.exercise.create({
      data: {
        userId: user.id,
        name,
        muscleGroup: muscleGroup || null,
        category: (category as Category) || 'strength',
        sets: sets || 3,
        reps: reps || 10,
        notes: notes || null,
      }
    })
    return NextResponse.json(exercise, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: 'Server error.', error: e.message }, { status: 500 })
  }
}
