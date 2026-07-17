-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'UNSURE');

-- CreateTable
CREATE TABLE "fixture_activations" (
    "id" UUID NOT NULL,
    "fixtureId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "activatedByUserId" UUID NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fixture_activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_availability_responses" (
    "id" UUID NOT NULL,
    "activationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fixture_availability_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fixture_activations_fixtureId_teamId_key" ON "fixture_activations"("fixtureId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "fixture_availability_responses_activationId_userId_key" ON "fixture_availability_responses"("activationId", "userId");

-- AddForeignKey
ALTER TABLE "fixture_activations" ADD CONSTRAINT "fixture_activations_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_activations" ADD CONSTRAINT "fixture_activations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_activations" ADD CONSTRAINT "fixture_activations_activatedByUserId_fkey" FOREIGN KEY ("activatedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_availability_responses" ADD CONSTRAINT "fixture_availability_responses_activationId_fkey" FOREIGN KEY ("activationId") REFERENCES "fixture_activations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_availability_responses" ADD CONSTRAINT "fixture_availability_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
