-- CreateTable
CREATE TABLE "MassOrderStep" (
    "id" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "part" TEXT NOT NULL,
    "partEn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "gesture" TEXT NOT NULL DEFAULT 'idle',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MassOrderStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MassOrderStep_stepIndex_key" ON "MassOrderStep"("stepIndex");

-- CreateIndex
CREATE INDEX "MassOrderStep_published_idx" ON "MassOrderStep"("published");
