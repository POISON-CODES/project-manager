/*
  Warnings:

  - Made the column `phoneNumber` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "stakeholderId" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
