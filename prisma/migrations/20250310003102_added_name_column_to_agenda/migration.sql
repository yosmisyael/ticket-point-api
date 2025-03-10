/*
  Warnings:

  - Added the required column `title` to the `agendas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agendas" ADD COLUMN     "title" TEXT NOT NULL;
