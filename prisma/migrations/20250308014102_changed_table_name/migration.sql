/*
  Warnings:

  - You are about to drop the `validations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "validations" DROP CONSTRAINT "validations_userId_fkey";

-- DropTable
DROP TABLE "validations";

-- CreateTable
CREATE TABLE "verifications" (
    "id" SERIAL NOT NULL,
    "type" "VerificationType" NOT NULL DEFAULT 'REGISTRATION',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
