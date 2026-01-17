/*
  Warnings:

  - Added the required column `type` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFY', 'MFA_OTP', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "verification" ADD COLUMN     "type" "VerificationType" NOT NULL;
