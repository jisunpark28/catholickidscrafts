-- CreateTable
CREATE TABLE "TrafficDay" (
    "date" TEXT NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TrafficDay_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "TrafficVisitorDay" (
    "visitorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "TrafficVisitorDay_pkey" PRIMARY KEY ("visitorId","date")
);

-- CreateIndex
CREATE INDEX "TrafficVisitorDay_date_idx" ON "TrafficVisitorDay"("date");
