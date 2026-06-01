-- CreateTable
CREATE TABLE "TypingWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "hint" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypingWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TypingWord_published_idx" ON "TypingWord"("published");
