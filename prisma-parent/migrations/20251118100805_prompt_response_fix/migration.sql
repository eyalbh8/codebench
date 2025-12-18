-- DropForeignKey
ALTER TABLE "prompt_responses" DROP CONSTRAINT "prompt_responses_prompt_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_responses" DROP CONSTRAINT "prompt_responses_scan_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_responses" DROP CONSTRAINT "prompt_responses_task_id_fkey";

-- DropForeignKey
ALTER TABLE "prompt_responses" DROP CONSTRAINT "prompt_responses_topic_id_fkey";

-- AlterTable
ALTER TABLE "prompt_responses" ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'LLM_SCAN',
ALTER COLUMN "topic_id" DROP NOT NULL,
ALTER COLUMN "prompt_id" DROP NOT NULL,
ALTER COLUMN "scan_id" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "task_id" DROP NOT NULL;
