/*
  Warnings:

  - The values [GENERAL,HANDOVER_PACKAGE] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `name` on the `form_templates` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `projects` table. All the data in the column will be lost.
  - Added the required column `title` to the `form_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('REQ_DOC', 'FEASIBILITY_DOC', 'HANDOVER_DOC', 'FINAL_SOW_DOC', 'OTHER');
ALTER TABLE "documents" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "documents" ALTER COLUMN "type" TYPE "DocumentType_new" USING ("type"::text::"DocumentType_new");
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "DocumentType_old";
ALTER TABLE "documents" ALTER COLUMN "type" SET DEFAULT 'OTHER';
COMMIT;

-- DropIndex
DROP INDEX "projects_status_idx";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "type" SET DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "form_templates" DROP COLUMN "name",
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "status";

-- DropEnum
DROP TYPE "ProjectStatus";

-- CreateIndex
CREATE INDEX "projects_currentStageId_idx" ON "projects"("currentStageId");
