/*
  Warnings:

  - You are about to drop the column `businessHoursEnd` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `businessHoursStart` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyEmail` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPhone` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `onboarding_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `platform_admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `platform_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `twilio_campaign_tracking` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[vapiPhoneNumber]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vapiAssistantId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VapiCallType" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "VapiCallStatus" AS ENUM ('QUEUED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELLED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "TwilioPhoneNumber" DROP CONSTRAINT "TwilioPhoneNumber_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "onboarding_status" DROP CONSTRAINT "onboarding_status_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "platform_admins" DROP CONSTRAINT "platform_admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "twilio_campaign_tracking" DROP CONSTRAINT "twilio_campaign_tracking_organizationId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "createdViaVapi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastVapiCallAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "createdViaVapi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vapiCallId" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "businessHoursEnd",
DROP COLUMN "businessHoursStart",
DROP COLUMN "emergencyEmail",
DROP COLUMN "emergencyPhone",
ADD COLUMN     "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vapiAccountId" TEXT,
ADD COLUMN     "vapiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vapiWebhookSecret" TEXT,
ALTER COLUMN "timezone" SET DEFAULT 'America/Los_Angeles';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "afterHoursMessage" TEXT,
ADD COLUMN     "aiGreeting" TEXT DEFAULT 'Thank you for calling. How can I help you today?',
ADD COLUMN     "aiInstructions" TEXT,
ADD COLUMN     "aiKnowledgeBase" JSONB,
ADD COLUMN     "aiPersonality" TEXT DEFAULT 'professional and helpful',
ADD COLUMN     "businessHoursEnd" TEXT DEFAULT '17:00',
ADD COLUMN     "businessHoursStart" TEXT DEFAULT '09:00',
ADD COLUMN     "city" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "estimatedMonthlyCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "lastCallAt" TIMESTAMP(3),
ADD COLUMN     "lastResetAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyCallCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyCallMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlySmsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'America/Los_Angeles',
ADD COLUMN     "vapiActivatedAt" TIMESTAMP(3),
ADD COLUMN     "vapiAssistantId" TEXT,
ADD COLUMN     "vapiDeactivatedAt" TIMESTAMP(3),
ADD COLUMN     "vapiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vapiPhoneNumber" TEXT,
ADD COLUMN     "vapiPhoneNumberId" TEXT,
ADD COLUMN     "vapiSetupCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "onboarding_status";

-- DropTable
DROP TABLE "platform_admins";

-- DropTable
DROP TABLE "platform_settings";

-- DropTable
DROP TABLE "twilio_campaign_tracking";

-- CreateTable
CREATE TABLE "VapiCall" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vapiCallId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "callerPhone" TEXT NOT NULL,
    "callerName" TEXT,
    "residentId" TEXT,
    "leadId" TEXT,
    "callType" "VapiCallType" NOT NULL DEFAULT 'INBOUND',
    "callStatus" "VapiCallStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "callDirection" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "assistantId" TEXT NOT NULL,
    "transcript" TEXT,
    "summary" TEXT,
    "sentiment" TEXT,
    "actionsTaken" JSONB,
    "recordingUrl" TEXT,
    "cost" DOUBLE PRECISION,
    "vapiMetadata" JSONB,
    "maintenanceRequestId" TEXT,

    CONSTRAINT "VapiCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VapiCall_vapiCallId_key" ON "VapiCall"("vapiCallId");

-- CreateIndex
CREATE UNIQUE INDEX "VapiCall_maintenanceRequestId_key" ON "VapiCall"("maintenanceRequestId");

-- CreateIndex
CREATE INDEX "VapiCall_propertyId_idx" ON "VapiCall"("propertyId");

-- CreateIndex
CREATE INDEX "VapiCall_organizationId_idx" ON "VapiCall"("organizationId");

-- CreateIndex
CREATE INDEX "VapiCall_callerPhone_idx" ON "VapiCall"("callerPhone");

-- CreateIndex
CREATE INDEX "VapiCall_residentId_idx" ON "VapiCall"("residentId");

-- CreateIndex
CREATE INDEX "VapiCall_leadId_idx" ON "VapiCall"("leadId");

-- CreateIndex
CREATE INDEX "VapiCall_callStatus_idx" ON "VapiCall"("callStatus");

-- CreateIndex
CREATE INDEX "VapiCall_createdAt_idx" ON "VapiCall"("createdAt");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_vapiCallId_idx" ON "MaintenanceRequest"("vapiCallId");

-- CreateIndex
CREATE INDEX "Organization_vapiEnabled_idx" ON "Organization"("vapiEnabled");

-- CreateIndex
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Property_vapiPhoneNumber_key" ON "Property"("vapiPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Property_vapiAssistantId_key" ON "Property"("vapiAssistantId");

-- CreateIndex
CREATE INDEX "Property_vapiPhoneNumber_idx" ON "Property"("vapiPhoneNumber");

-- CreateIndex
CREATE INDEX "Property_vapiAssistantId_idx" ON "Property"("vapiAssistantId");

-- CreateIndex
CREATE INDEX "Property_vapiEnabled_idx" ON "Property"("vapiEnabled");

-- CreateIndex
CREATE INDEX "User_isSuperAdmin_idx" ON "User"("isSuperAdmin");

-- AddForeignKey
ALTER TABLE "VapiCall" ADD CONSTRAINT "VapiCall_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VapiCall" ADD CONSTRAINT "VapiCall_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VapiCall" ADD CONSTRAINT "VapiCall_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VapiCall" ADD CONSTRAINT "VapiCall_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VapiCall" ADD CONSTRAINT "VapiCall_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
