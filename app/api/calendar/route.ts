import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const group = request.nextUrl.searchParams.get("group");

  if (!group) {
    return NextResponse.json(
      { error: "El parámetro 'group' es obligatorio" },
      { status: 400 },
    );
  }

  const classSessions = await prisma.classSession.findMany({
    where: { group: { name: group } },
    include: { subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(classSessions);
}
