/*
  Warnings:

  - A unique constraint covering the columns `[credential]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tickets_credential_key" ON "tickets"("credential");
