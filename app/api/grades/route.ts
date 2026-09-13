import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const anonId = body?.anonId;
  const subjectId = body?.subjectId;
  const component = typeof body?.component === "string" ? body.component.trim() : "";
  const value = body?.value;

  if (!anonId || !subjectId || !component || typeof value !== "number" || !Number.isFinite(value)) {
    return NextResponse.json(
      { error: "anonId, subjectId, component y value (número) son obligatorios" },
      { status: 400 },
    );
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Asignatura no encontrada" }, { status: 404 });
  }

  const user = await prisma.user.upsert({
    where: { anonId },
    update: {},
    create: { anonId },
  });

  const grade = await prisma.userGrade.upsert({
    where: { userId_subjectId_component: { userId: user.id, subjectId, component } },
    update: { value },
    create: { userId: user.id, subjectId, component, value },
  });

  return NextResponse.json(grade);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const anonId = body?.anonId;
  const subjectId = body?.subjectId;
  const component = typeof body?.component === "string" ? body.component.trim() : "";

  if (!anonId || !subjectId || !component) {
    return NextResponse.json(
      { error: "anonId, subjectId y component son obligatorios" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { anonId } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  await prisma.userGrade
    .delete({ where: { userId_subjectId_component: { userId: user.id, subjectId, component } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
