-- DropIndex
DROP INDEX IF EXISTS "embedding_chunks_authority_score_idx";

-- AlterTable
ALTER TABLE "account_settings" ALTER COLUMN "generate_weekly_insights" SET DEFAULT false;

-- AlterTable
ALTER TABLE "content_sources" ADD COLUMN     "chunks_ingested" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ingestion_error" TEXT,
ADD COLUMN     "ingestion_status" TEXT,
ADD COLUMN     "last_ingested_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "published_url" TEXT,
ADD COLUMN     "schemas_included" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "tracked_recommendations" ALTER COLUMN "recommendation_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "content_sources_account_id_ingestion_status_idx" ON "content_sources"("account_id", "ingestion_status");
