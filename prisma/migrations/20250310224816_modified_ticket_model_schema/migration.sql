/*
  Warnings:

  - You are about to drop the column `checkinDate` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `isCheckin` on the `tickets` table. All the data in the column will be lost.
  - Added the required column `billing` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `check_in_date` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_check_in` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "checkinDate",
DROP COLUMN "isCheckin",
ADD COLUMN     "billing" BOOLEAN NOT NULL,
ADD COLUMN     "check_in_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_check_in" BOOLEAN NOT NULL,
ALTER COLUMN "tier_id" DROP NOT NULL;
