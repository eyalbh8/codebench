/*
  Warnings:

  - Made the column `avg_visibility` on table `prompts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "prompts" ALTER COLUMN "avg_visibility" SET NOT NULL,
ALTER COLUMN "avg_visibility" SET DEFAULT 0;
