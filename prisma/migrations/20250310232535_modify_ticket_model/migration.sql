/*
  Warnings:

  - You are about to drop the column `billing` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "billing",
ADD COLUMN     "paymentStat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymetMethode" TEXT,
ALTER COLUMN "check_in_date" DROP NOT NULL,
ALTER COLUMN "is_check_in" SET DEFAULT false;
