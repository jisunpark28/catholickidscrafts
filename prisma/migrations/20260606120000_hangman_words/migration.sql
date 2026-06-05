-- CreateTable
CREATE TABLE "HangmanWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "hint" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HangmanWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HangmanWord_word_key" ON "HangmanWord"("word");

-- CreateIndex
CREATE INDEX "HangmanWord_published_idx" ON "HangmanWord"("published");
