import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: sevenDaysAgo } },
    include: { items: { include: { exercise: true } } },
    orderBy: { date: "asc" },
  });

  // Weekly chart data
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const log = logs.find(
      (l) => new Date(l.date).toDateString() === d.toDateString()
    );
    return {
      day: dayNames[d.getDay()],
      total: log?.items.length ?? 0,
      completed: log?.items.filter((it) => it.isChecked).length ?? 0,
    };
  });

  // Streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const log = await prisma.dailyLog.findUnique({
      where: { userId_date: { userId, date: d } },
      include: { items: true },
    });
    if (log && log.items.some((it) => it.isChecked)) {
      streak++;
    } else {
      break;
    }
  }

  // Top exercises
  const allItems = await prisma.dailyLogItem.findMany({
    where: { dailyLog: { userId }, isChecked: true },
    include: { exercise: true },
  });

  const exerciseCount: Record<string, { name: string; count: number }> = {};
  for (const item of allItems) {
    if (!exerciseCount[item.exerciseId]) {
      exerciseCount[item.exerciseId] = { name: item.exercise.name, count: 0 };
    }
    exerciseCount[item.exerciseId].count++;
  }

  const topExercises = Object.values(exerciseCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  for (const item of allItems) {
    const cat = item.exercise.category;
    categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
  }

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Total this week
  const weekItems = logs.flatMap((l) => l.items);
  const totalWeek = weekItems.length;
  const completedWeek = weekItems.filter((i) => i.isChecked).length;

  return NextResponse.json({
    streak,
    totalWeek,
    completedWeek,
    weeklyData,
    topExercises,
    categoryData,
  });
}
