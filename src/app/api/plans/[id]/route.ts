import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, description, exerciseIds } = await req.json();

  const existing = await prisma.plan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });

  // Delete old items and recreate
  await prisma.planItem.deleteMany({ where: { planId: id } });

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      description: description ?? null,
      items: {
        create: (exerciseIds ?? []).map((exerciseId: string, i: number) => ({
          exerciseId,
          order: i,
        })),
      },
    },
    include: {
      items: { include: { exercise: true }, orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(plan);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.plan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });

  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ message: "Berhasil dihapus" });
}