-- DropIndex
DROP INDEX "accounts_name_key";

-- AlterTable
ALTER TABLE "account_settings" ALTER COLUMN "generate_weekly_insights" SET DEFAULT false;
