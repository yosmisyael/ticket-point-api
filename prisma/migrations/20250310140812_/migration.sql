/*
  Warnings:

  - You are about to drop the `tier_bennefit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tier_bennefit" DROP CONSTRAINT "tier_bennefit_tier_id_fkey";

-- DropTable
DROP TABLE "tier_bennefit";

-- CreateTable
CREATE TABLE "tier_benefit" (
    "id" SERIAL NOT NULL,
    "tier_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tier_benefit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tier_benefit" ADD CONSTRAINT "tier_benefit_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
