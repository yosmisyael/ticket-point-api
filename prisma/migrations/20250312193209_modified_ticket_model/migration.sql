/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStat` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "paymentMethod",
DROP COLUMN "paymentStat",
ADD COLUMN     "fraud_status" TEXT,
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "transaction_status" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transaction_time" TIMESTAMP(3),
ADD COLUMN     "transaction_type" TEXT;
