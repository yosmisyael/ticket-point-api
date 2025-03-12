/*
  Warnings:

  - You are about to drop the column `attendee` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_name` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "attendee",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "organization_name" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL;
