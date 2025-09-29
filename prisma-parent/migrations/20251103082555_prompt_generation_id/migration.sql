-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "generation_id" UUID,
ADD COLUMN     "job_id" UUID;

-- CreateIndex
CREATE INDEX "prompts_generation_id_idx" ON "prompts"("generation_id");
