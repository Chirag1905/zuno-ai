/*
  Warnings:

  - Added the required column `periodIntervalDays` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `tokensRemaining` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "periodIntervalDays" INTEGER NOT NULL,
ADD COLUMN     "periodStart" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "provider" DROP NOT NULL,
ALTER COLUMN "tokensRemaining" SET NOT NULL;
