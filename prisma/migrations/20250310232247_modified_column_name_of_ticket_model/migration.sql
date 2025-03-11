/*
  Warnings:

  - You are about to drop the column `atendee` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `attendee` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "atendee",
ADD COLUMN     "attendee" TEXT NOT NULL;
