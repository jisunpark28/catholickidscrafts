-- One-time Plus passes (additive only)
CREATE TABLE "PlusPass" (
    "id" TEXT NOT NULL,
    "familyAccountId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "amountTotal" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "reminder7SentAt" TIMESTAMP(3),
    "reminder1SentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlusPass_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlusPass_stripeCheckoutSessionId_key" ON "PlusPass"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "PlusPass_stripePaymentIntentId_key" ON "PlusPass"("stripePaymentIntentId");
CREATE INDEX "PlusPass_familyAccountId_expiresAt_idx" ON "PlusPass"("familyAccountId", "expiresAt");
CREATE INDEX "PlusPass_expiresAt_idx" ON "PlusPass"("expiresAt");

ALTER TABLE "PlusPass" ADD CONSTRAINT "PlusPass_familyAccountId_fkey" FOREIGN KEY ("familyAccountId") REFERENCES "FamilyAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
