import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { Category } from '@prisma/client'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  const existing = await prisma.exercise.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  const { name, muscleGroup, category, sets, reps, notes } = await req.json()
  const updated = await prisma.exercise.update({
    where: { id },
    data: { name, muscleGroup, category: category as Category, sets, reps, notes }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  const existing = await prisma.exercise.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted.' })
}
