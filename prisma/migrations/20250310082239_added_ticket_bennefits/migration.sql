/*
  Warnings:

  - You are about to drop the column `benefits` on the `tiers` table. All the data in the column will be lost.
  - Added the required column `currency` to the `tiers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon_color` to the `tiers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tiers" DROP COLUMN "benefits",
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "icon_color" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tier_bennefit" (
    "id" SERIAL NOT NULL,
    "tier_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tier_bennefit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tier_bennefit" ADD CONSTRAINT "tier_bennefit_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
