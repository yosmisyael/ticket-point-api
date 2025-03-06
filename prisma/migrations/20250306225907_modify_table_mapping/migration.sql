/*
  Warnings:

  - You are about to drop the `Agenda` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Faq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Validation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agenda" DROP CONSTRAINT "Agenda_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "Faq" DROP CONSTRAINT "Faq_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "Tier" DROP CONSTRAINT "Tier_event_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Validation" DROP CONSTRAINT "Validation_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToEvent" DROP CONSTRAINT "_CategoryToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToEvent" DROP CONSTRAINT "_CategoryToEvent_B_fkey";

-- DropTable
DROP TABLE "Agenda";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Faq";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "Tier";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Validation";

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo_url" TEXT,
    "website_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validations" (
    "id" SERIAL NOT NULL,
    "type" "ValidationType" NOT NULL DEFAULT 'REGISTRATION',
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "format" "Format" NOT NULL,
    "is_published" BOOLEAN NOT NULL,
    "banner_url" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "start_time" INTEGER NOT NULL,
    "end_time" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "owner_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendas" (
    "id" SERIAL NOT NULL,
    "start_time" INTEGER NOT NULL,
    "end_time" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "remains" INTEGER NOT NULL,
    "format" "Format" NOT NULL,
    "benefits" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "atendee" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tier_id" INTEGER NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
