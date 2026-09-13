import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const anonId = body?.anonId;
  const subjectId = body?.subjectId;
  const group = body?.group;

  if (!anonId || !subjectId || !group) {
    return NextResponse.json(
      { error: "anonId, subjectId y group son obligatorios" },
      { status: 400 },
    );
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Asignatura no encontrada" }, { status: 404 });
  }

  const groupRecord = await prisma.group.findFirst({
    where: { name: group, semester: subject.semester },
  });
  if (!groupRecord) {
    return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  }

  const user = await prisma.user.upsert({
    where: { anonId },
    update: {},
    create: { anonId },
  });

  const selection = await prisma.userSubjectSelection.upsert({
    where: { userId_subjectId: { userId: user.id, subjectId } },
    update: { groupId: groupRecord.id },
    create: { userId: user.id, subjectId, groupId: groupRecord.id },
  });

  return NextResponse.json(selection);
}
