import {
  PrismaClient,
  University,
  DayOfWeek,
  SessionType,
  ExamOrDeadlineType,
} from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const SEMESTER = 1;

const GROUPS = [
  { id: "group-10", name: "10", semester: SEMESTER },
  { id: "group-11", name: "11", semester: SEMESTER },
  { id: "group-12", name: "12", semester: SEMESTER },
];

const SUBJECTS = [
  {
    code: "CI",
    name: "Computational Intelligence",
    ects: 5,
    university: University.UPC,
    semester: SEMESTER,
  },
  {
    code: "CV",
    name: "Computational Vision",
    ects: 5,
    university: University.UB,
    semester: SEMESTER,
  },
  {
    code: "IHLT",
    name: "Introduction to Human Language Technology",
    ects: 5,
    university: University.UPC,
    semester: SEMESTER,
  },
  {
    code: "IMAS",
    name: "Introduction to MultiAgent Systems",
    ects: 5,
    university: University.URV,
    semester: SEMESTER,
  },
  {
    code: "IML",
    name: "Introduction to Machine Learning",
    ects: 5,
    university: University.UB,
    semester: SEMESTER,
  },
  {
    code: "PAR",
    name: "Planning and Approximate Reasoning",
    ects: 5,
    university: University.URV,
    semester: SEMESTER,
  },
];

// Corregido a partir de una captura del horario real (sustituye la
// lectura original de Horari_MAI.pdf para IML/CV/IHLT/CI — PAR e IMAS
// no cambian). Grups 10, 11 i 12.
const CLASS_SESSIONS: {
  subjectCode: string;
  groupId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  type: SessionType;
}[] = [
  // IML — dimarts (UB)
  { subjectCode: "IML", groupId: "group-10", dayOfWeek: DayOfWeek.TUESDAY, startTime: "10:00", endTime: "12:00", type: SessionType.THEORY },
  { subjectCode: "IML", groupId: "group-11", dayOfWeek: DayOfWeek.TUESDAY, startTime: "12:00", endTime: "13:00", type: SessionType.PROBLEMS },
  { subjectCode: "IML", groupId: "group-12", dayOfWeek: DayOfWeek.TUESDAY, startTime: "13:00", endTime: "14:00", type: SessionType.PROBLEMS },

  // CV — dimarts (UB)
  { subjectCode: "CV", groupId: "group-10", dayOfWeek: DayOfWeek.TUESDAY, startTime: "14:00", endTime: "16:00", type: SessionType.THEORY },
  { subjectCode: "CV", groupId: "group-11", dayOfWeek: DayOfWeek.TUESDAY, startTime: "16:00", endTime: "17:00", type: SessionType.PROBLEMS },
  { subjectCode: "CV", groupId: "group-12", dayOfWeek: DayOfWeek.TUESDAY, startTime: "17:00", endTime: "18:00", type: SessionType.PROBLEMS },

  // IHLT — dijous (UPC)
  { subjectCode: "IHLT", groupId: "group-10", dayOfWeek: DayOfWeek.THURSDAY, startTime: "10:00", endTime: "12:00", type: SessionType.THEORY },
  { subjectCode: "IHLT", groupId: "group-11", dayOfWeek: DayOfWeek.THURSDAY, startTime: "12:00", endTime: "13:00", type: SessionType.LAB },
  { subjectCode: "IHLT", groupId: "group-12", dayOfWeek: DayOfWeek.THURSDAY, startTime: "13:00", endTime: "14:00", type: SessionType.LAB },

  // PAR — dimecres (URV)
  { subjectCode: "PAR", groupId: "group-10", dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "11:00", endTime: "13:00", type: SessionType.THEORY },
  { subjectCode: "PAR", groupId: "group-11", dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "16:00", endTime: "17:00", type: SessionType.LAB },
  { subjectCode: "PAR", groupId: "group-12", dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "17:00", endTime: "18:00", type: SessionType.LAB },

  // IMAS — dimecres (URV)
  { subjectCode: "IMAS", groupId: "group-10", dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "14:00", endTime: "16:00", type: SessionType.THEORY },
  { subjectCode: "IMAS", groupId: "group-11", dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "17:00", endTime: "18:00", type: SessionType.LAB },
  { subjectCode: "IMAS", groupId: "group-12", dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "16:00", endTime: "17:00", type: SessionType.LAB },

  // CI — dijous (UPC), sessio conjunta 10+11+12
  { subjectCode: "CI", groupId: "group-10", dayOfWeek: DayOfWeek.THURSDAY, startTime: "15:00", endTime: "18:00", type: SessionType.THEORY_LAB },
  { subjectCode: "CI", groupId: "group-11", dayOfWeek: DayOfWeek.THURSDAY, startTime: "15:00", endTime: "18:00", type: SessionType.THEORY_LAB },
  { subjectCode: "CI", groupId: "group-12", dayOfWeek: DayOfWeek.THURSDAY, startTime: "15:00", endTime: "18:00", type: SessionType.THEORY_LAB },
];

function toTimeDate(hhmm: string): Date {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes));
}

// Fechas reales confirmadas — curs 2026-27, 1r semestre (veure
// CALENDARIO-ACADEMICO.md). Solo se cargan las que están confirmadas
// oficialmente; IMAS y PAR aún no tienen fecha de examen anunciada.
const EXAMS: {
  subjectCode: string;
  date: string; // ISO, hora local del examen en UTC
  type: ExamOrDeadlineType;
}[] = [
  { subjectCode: "CV", date: "2026-11-03T14:00:00Z", type: ExamOrDeadlineType.MIDTERM },
  { subjectCode: "IML", date: "2026-12-15T10:00:00Z", type: ExamOrDeadlineType.EXAM },
  { subjectCode: "CV", date: "2026-12-15T14:00:00Z", type: ExamOrDeadlineType.EXAM },
  { subjectCode: "CI", date: "2027-01-07T15:00:00Z", type: ExamOrDeadlineType.EXAM },
  { subjectCode: "IHLT", date: "2027-01-14T11:30:00Z", type: ExamOrDeadlineType.EXAM },
];

async function main() {
  for (const group of GROUPS) {
    await prisma.group.upsert({
      where: { id: group.id },
      update: { name: group.name, semester: group.semester },
      create: group,
    });
  }

  const subjectIdByCode = new Map<string, string>();
  for (const subject of SUBJECTS) {
    const record = await prisma.subject.upsert({
      where: { code: subject.code },
      update: {
        name: subject.name,
        ects: subject.ects,
        university: subject.university,
        semester: subject.semester,
      },
      create: subject,
    });
    subjectIdByCode.set(subject.code, record.id);
  }

  await prisma.classSession.deleteMany({
    where: { subjectId: { in: [...subjectIdByCode.values()] } },
  });

  for (const session of CLASS_SESSIONS) {
    const subjectId = subjectIdByCode.get(session.subjectCode);
    if (!subjectId) {
      throw new Error(`Subject not seeded: ${session.subjectCode}`);
    }

    await prisma.classSession.create({
      data: {
        subjectId,
        groupId: session.groupId,
        dayOfWeek: session.dayOfWeek,
        startTime: toTimeDate(session.startTime),
        endTime: toTimeDate(session.endTime),
        type: session.type,
      },
    });
  }

  await prisma.examOrDeadline.deleteMany({
    where: { subjectId: { in: [...subjectIdByCode.values()] } },
  });

  for (const exam of EXAMS) {
    const subjectId = subjectIdByCode.get(exam.subjectCode);
    if (!subjectId) {
      throw new Error(`Subject not seeded: ${exam.subjectCode}`);
    }

    for (const group of GROUPS) {
      await prisma.examOrDeadline.create({
        data: {
          subjectId,
          groupId: group.id,
          date: new Date(exam.date),
          type: exam.type,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
