import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  const item = await prisma.checklistItem.findFirst({ where: { id, userId: user.id } })
  if (!item) return NextResponse.json({ message: 'Not found.' }, { status: 404 })
  const newVal = !item.isCompleted
  const updated = await prisma.checklistItem.update({
    where: { id },
    data: { isCompleted: newVal, completedAt: newVal ? new Date() : null }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const id = parseInt(params.id)
  await prisma.checklistItem.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ message: 'Removed.' })
}
