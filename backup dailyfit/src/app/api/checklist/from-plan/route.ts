import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const { planId, date } = await req.json()
    const targetDate = date ? new Date(date) : new Date(new Date().toISOString().split('T')[0])
    const planExercises = await prisma.planExercise.findMany({ where: { planId } })
    for (const pe of planExercises) {
      const existing = await prisma.checklistItem.findFirst({
        where: { userId: user.id, exerciseId: pe.exerciseId, date: targetDate }
      })
      if (!existing) {
        await prisma.checklistItem.create({
          data: { userId: user.id, exerciseId: pe.exerciseId, planId, date: targetDate }
        })
      }
    }
    return NextResponse.json({ message: 'Checklist generated.' })
  } catch (e: any) {
    return NextResponse.json({ message: 'Server error.', error: e.message }, { status: 500 })
  }
}
