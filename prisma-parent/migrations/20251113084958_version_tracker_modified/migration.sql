/*
  Warnings:

  - You are about to drop the column `version` on the `analytics_events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "analytics_events" DROP COLUMN "version",
ADD COLUMN     "tracker_version" TEXT NOT NULL DEFAULT 'v';
