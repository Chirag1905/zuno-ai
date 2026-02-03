-- AlterTable: Change amount column type from INTEGER to DOUBLE PRECISION
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- Convert existing payment amounts from paise to rupees (divide by 100)
UPDATE "Payment" SET "amount" = "amount" / 100;
