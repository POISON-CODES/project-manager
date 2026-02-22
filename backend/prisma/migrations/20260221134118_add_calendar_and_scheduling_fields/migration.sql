/*
  Warnings:

  - You are about to drop the column `target` on the `user_activities` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `user_activities` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `user_activities` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('MEETING', 'BREAK', 'OOO', 'OTHER');

-- DropForeignKey
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_userId_fkey";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledEnd" TIMESTAMP(3),
ADD COLUMN     "scheduledStart" TIMESTAMP(3),
ADD COLUMN     "totalMinutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_activities" DROP COLUMN "target",
DROP COLUMN "targetId",
DROP COLUMN "targetType",
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityName" TEXT,
ADD COLUMN     "entityType" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CalendarEventType" NOT NULL DEFAULT 'OTHER',
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_events_userId_idx" ON "calendar_events"("userId");

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
