/*
  Warnings:

  - You are about to drop the column `banner_url` on the `events` table. All the data in the column will be lost.
  - Added the required column `cover_image` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "banner_url",
ADD COLUMN     "cover_image" TEXT NOT NULL;
