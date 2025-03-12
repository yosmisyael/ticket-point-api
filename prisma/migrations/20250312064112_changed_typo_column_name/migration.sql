/*
  Warnings:

  - You are about to drop the column `paymetMethode` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "paymetMethode",
ADD COLUMN     "paymentMethod" TEXT;
