-- CreateEnum
CREATE TYPE "SubRequestStatus" AS ENUM ('OPEN', 'FILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "availability_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_requests" (
    "id" UUID NOT NULL,
    "fixtureId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "requestingCaptainUserId" UUID NOT NULL,
    "status" "SubRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledByUserId" UUID,
    "filledAt" TIMESTAMP(3),

    CONSTRAINT "sub_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "availability_preferences_userId_dayOfWeek_timeSlot_key" ON "availability_preferences"("userId", "dayOfWeek", "timeSlot");

-- AddForeignKey
ALTER TABLE "availability_preferences" ADD CONSTRAINT "availability_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_requests" ADD CONSTRAINT "sub_requests_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_requests" ADD CONSTRAINT "sub_requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_requests" ADD CONSTRAINT "sub_requests_requestingCaptainUserId_fkey" FOREIGN KEY ("requestingCaptainUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_requests" ADD CONSTRAINT "sub_requests_filledByUserId_fkey" FOREIGN KEY ("filledByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
