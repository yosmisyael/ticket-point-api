-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "tier_benefit" DROP CONSTRAINT "tier_benefit_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "tiers" DROP CONSTRAINT "tiers_event_id_fkey";

-- AddForeignKey
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_benefit" ADD CONSTRAINT "tier_benefit_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
