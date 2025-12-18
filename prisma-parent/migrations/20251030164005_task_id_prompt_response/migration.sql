-- AlterTable
ALTER TABLE "prompt_responses" ADD COLUMN     "task_id" UUID NOT NULL DEFAULT 'df969ef8-2baa-448c-b060-f86484899748';

-- AddForeignKey
ALTER TABLE "prompt_responses" ADD CONSTRAINT "prompt_responses_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
