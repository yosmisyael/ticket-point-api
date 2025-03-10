/*
  Warnings:

  - You are about to drop the column `url` on the `event_locations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_locations" DROP COLUMN "url",
ADD COLUMN     "platform_url" TEXT;
