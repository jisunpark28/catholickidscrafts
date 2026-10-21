-- CreateTable
CREATE TABLE "GospelSheet" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sundayDate" DATE NOT NULL,
    "liturgicalName" TEXT NOT NULL,
    "gospelRef" TEXT NOT NULL,
    "usccbUrl" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'green',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "levels" JSONB NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GospelSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmToken" TEXT,
    "unsubscribeToken" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3),
    "consentIp" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GospelSheet_slug_key" ON "GospelSheet"("slug");
CREATE UNIQUE INDEX "GospelSheet_sundayDate_key" ON "GospelSheet"("sundayDate");
CREATE INDEX "GospelSheet_published_sundayDate_idx" ON "GospelSheet"("published", "sundayDate");
CREATE UNIQUE INDEX "EmailSubscriber_email_key" ON "EmailSubscriber"("email");
CREATE UNIQUE INDEX "EmailSubscriber_confirmToken_key" ON "EmailSubscriber"("confirmToken");
CREATE UNIQUE INDEX "EmailSubscriber_unsubscribeToken_key" ON "EmailSubscriber"("unsubscribeToken");
CREATE INDEX "EmailSubscriber_status_idx" ON "EmailSubscriber"("status");
