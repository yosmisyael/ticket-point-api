/*
  Warnings:

  - Added the required column `user_id` to the `authentications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "authentications" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "authentications" ADD CONSTRAINT "authentications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
