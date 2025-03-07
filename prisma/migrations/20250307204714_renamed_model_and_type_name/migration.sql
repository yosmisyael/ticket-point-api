/*
  Warnings:

  - The `type` column on the `validations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');

-- AlterTable
ALTER TABLE "validations" DROP COLUMN "type",
ADD COLUMN     "type" "VerificationType" NOT NULL DEFAULT 'REGISTRATION';

-- DropEnum
DROP TYPE "ValidationType";
