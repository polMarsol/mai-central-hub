-- CreateEnum
CREATE TYPE "University" AS ENUM ('UPC', 'UB', 'URV');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('THEORY', 'LAB', 'PROBLEMS', 'THEORY_LAB');

-- CreateEnum
CREATE TYPE "ExamOrDeadlineType" AS ENUM ('EXAM', 'DEADLINE');

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ects" DOUBLE PRECISION NOT NULL,
    "university" "University" NOT NULL,
    "semester" INTEGER NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "type" "SessionType" NOT NULL,
    "room" TEXT,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams_or_deadlines" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ExamOrDeadlineType" NOT NULL,

    CONSTRAINT "exams_or_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "anon_id" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subject_selections" (
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,

    CONSTRAINT "user_subject_selections_pkey" PRIMARY KEY ("user_id","subject_id")
);

-- CreateTable
CREATE TABLE "user_grades" (
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "user_grades_pkey" PRIMARY KEY ("user_id","subject_id","component")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_anon_id_key" ON "users"("anon_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams_or_deadlines" ADD CONSTRAINT "exams_or_deadlines_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams_or_deadlines" ADD CONSTRAINT "exams_or_deadlines_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_selections" ADD CONSTRAINT "user_subject_selections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_selections" ADD CONSTRAINT "user_subject_selections_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subject_selections" ADD CONSTRAINT "user_subject_selections_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_grades" ADD CONSTRAINT "user_grades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_grades" ADD CONSTRAINT "user_grades_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
