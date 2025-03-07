/*
  Warnings:

  - You are about to drop the column `code` on the `validations` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `validations` table. All the data in the column will be lost.
  - You are about to drop the column `is_valid` on the `validations` table. All the data in the column will be lost.
  - Added the required column `token` to the `validations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "validations" DROP COLUMN "code",
DROP COLUMN "email",
DROP COLUMN "is_valid",
ADD COLUMN     "token" TEXT NOT NULL;
