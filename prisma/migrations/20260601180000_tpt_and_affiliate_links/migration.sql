-- AlterTable
ALTER TABLE "Resource" ADD COLUMN "tptUrl" TEXT,
ADD COLUMN "isFreeSample" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "previewImageUrl" TEXT;

-- CreateEnum
CREATE TYPE "ExternalLinkType" AS ENUM ('STANDARD', 'AMAZON_AFFILIATE');

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN "linkType" "ExternalLinkType" NOT NULL DEFAULT 'STANDARD';
