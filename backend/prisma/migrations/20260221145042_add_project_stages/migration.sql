-- CreateTable
CREATE TABLE "project_stages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "icon" TEXT DEFAULT 'Clock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_stages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "project_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
