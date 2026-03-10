import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const type = new URL(req.url).searchParams.get('type') || 'overview'
  const uid = user.id

  if (type === 'overview') {
    const [totalEx, totalPlans, allItems, completed] = await Promise.all([
      prisma.exercise.count({ where: { userId: uid } }),
      prisma.workoutPlan.count({ where: { userId: uid } }),
      prisma.checklistItem.count({ where: { userId: uid } }),
      prisma.checklistItem.count({ where: { userId: uid, isCompleted: true } }),
    ])
    const distinctDates = await prisma.checklistItem.findMany({
      where: { userId: uid },
      select: { date: true },
      distinct: ['date']
    })

    // Streak calculation
    const today = new Date()
    today.setHours(0,0,0,0)
    const activeDates = await prisma.$queryRaw<{date: Date}[]>`
      SELECT DISTINCT date FROM ChecklistItem 
      WHERE userId = ${uid}
      AND date <= CURDATE()
      AND (SELECT COUNT(*) FROM ChecklistItem c2 WHERE c2.userId = ${uid} AND c2.date = ChecklistItem.date AND c2.isCompleted = 1) > 0
      ORDER BY date DESC
    `
    let streak = 0
    for (let i = 0; i < activeDates.length; i++) {
      const d = new Date(activeDates[i].date)
      d.setHours(0,0,0,0)
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
      if (diff === i || diff === i + 1) streak++
      else break
    }

    return NextResponse.json({
      totalExercises: totalEx,
      totalPlans,
      totalWorkoutDays: distinctDates.length,
      completionRate: allItems > 0 ? Math.round((completed / allItems) * 100) : 0,
      streak
    })
  }

  if (type === 'weekly') {
    const rows = await prisma.$queryRaw<{date: Date, total: bigint, completed: bigint}[]>`
      SELECT date,
        COUNT(*) as total,
        SUM(isCompleted) as completed
      FROM ChecklistItem
      WHERE userId = ${uid} AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY date ORDER BY date ASC
    `
    const result = []
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0,0,0,0)
      const dateStr = d.toISOString().split('T')[0]
      const found = rows.find(r => {
        const rd = new Date(r.date)
        return rd.toISOString().split('T')[0] === dateStr
      })
      result.push({
        date: dateStr,
        day: days[d.getDay()],
        total: found ? Number(found.total) : 0,
        completed: found ? Number(found.completed) : 0
      })
    }
    return NextResponse.json(result)
  }

  if (type === 'categories') {
    const rows = await prisma.$queryRaw<{category: string, total: bigint, completed: bigint}[]>`
      SELECT e.category, COUNT(c.id) as total, SUM(c.isCompleted) as completed
      FROM ChecklistItem c JOIN Exercise e ON c.exerciseId = e.id
      WHERE c.userId = ${uid}
      GROUP BY e.category
    `
    return NextResponse.json(rows.map(r => ({
      category: r.category,
      total: Number(r.total),
      completed: Number(r.completed)
    })))
  }

  return NextResponse.json({ message: 'Invalid type.' }, { status: 400 })
}
