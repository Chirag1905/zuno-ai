/*
  Warnings:

  - You are about to drop the `OtpAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrustedDevice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TrustedDevice" DROP CONSTRAINT "TrustedDevice_userId_fkey";

-- DropTable
DROP TABLE "OtpAttempt";

-- DropTable
DROP TABLE "TrustedDevice";

-- CreateTable
CREATE TABLE "trusted_device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trusted_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_attempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trusted_device_userId_idx" ON "trusted_device"("userId");

-- CreateIndex
CREATE INDEX "trusted_device_expiresAt_idx" ON "trusted_device"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_attempt_email_idx" ON "otp_attempt"("email");

-- CreateIndex
CREATE INDEX "otp_attempt_lockedAt_idx" ON "otp_attempt"("lockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "otp_attempt_email_ip_key" ON "otp_attempt"("email", "ip");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "verification"("expiresAt");

-- AddForeignKey
ALTER TABLE "trusted_device" ADD CONSTRAINT "trusted_device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
