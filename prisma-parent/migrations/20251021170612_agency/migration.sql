-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "is_under_agency" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_agency" BOOLEAN NOT NULL DEFAULT false;
