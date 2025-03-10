/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `tiers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,format]` on the table `tiers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tiers_name_key" ON "tiers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tiers_name_format_key" ON "tiers"("name", "format");
