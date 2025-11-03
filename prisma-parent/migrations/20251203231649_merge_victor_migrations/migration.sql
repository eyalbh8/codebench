-- This is a combined migration for Victor related features.
-- Original migrations merged:
-- 20250130120000_add_metadata_to_content_source
-- 20251124152302_add_victor_embedding_tables
-- 20251126095307_add_source_authority_tracking
-- 20251202143327_add_is_active_to_embedding_chunks

-- pgvector extension removed - vectors now stored in Qdrant

-- CreateTable
CREATE TABLE "content_sources" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "original_table" TEXT,
    "original_id" TEXT,
    "language" TEXT,
    "title" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "is_user_provided" BOOLEAN NOT NULL DEFAULT false,
    "authority_score" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "content_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embedding_chunks" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "content_source_id" UUID NOT NULL,
    "source_type" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "authority_score" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "embedding_chunks_pkey" PRIMARY KEY ("id")
);
-- Note: embedding column removed - vectors now stored in Qdrant

-- CreateTable
CREATE TABLE "post_chunk_usage" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "chunk_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_chunk_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_sources_account_id_source_type_idx" ON "content_sources"("account_id", "source_type");
CREATE INDEX "embedding_chunks_account_id_source_type_idx" ON "embedding_chunks"("account_id", "source_type");
CREATE INDEX "embedding_chunks_content_source_id_idx" ON "embedding_chunks"("content_source_id");
CREATE INDEX "post_chunk_usage_post_id_idx" ON "post_chunk_usage"("post_id");
CREATE INDEX "post_chunk_usage_chunk_id_idx" ON "post_chunk_usage"("chunk_id");
CREATE INDEX "embedding_chunks_authority_score_idx" ON "embedding_chunks"("authority_score");
CREATE INDEX "embedding_chunks_account_id_is_active_idx" ON "embedding_chunks"("account_id", "is_active");
-- Note: embedding vector index removed - vectors now in Qdrant

-- AlterTable (add AI stats columns to posts)
ALTER TABLE "posts" ADD COLUMN "appearances_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "posts" ADD COLUMN "visibility_score" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "posts" ADD COLUMN "first_seen_at" TIMESTAMPTZ(3);
ALTER TABLE "posts" ADD COLUMN "last_seen_at" TIMESTAMPTZ(3);

-- Backfill existing data with appropriate authority scores
-- BRANDBOOK sources are user-provided with highest authority
UPDATE "content_sources" 
SET "is_user_provided" = true, "authority_score" = 1.0 
WHERE "source_type" = 'BRANDBOOK';

UPDATE "embedding_chunks" 
SET "authority_score" = 1.0 
WHERE "source_type" = 'BRANDBOOK';

-- COMPETITOR_SOURCE_ANALYSIS sources are system-discovered with lower authority
UPDATE "content_sources" 
SET "is_user_provided" = false, "authority_score" = 0.6 
WHERE "source_type" = 'COMPETITOR_SOURCE_ANALYSIS';

UPDATE "embedding_chunks" 
SET "authority_score" = 0.6 
WHERE "source_type" = 'COMPETITOR_SOURCE_ANALYSIS';

-- POST and RECOMMENDATION sources get neutral authority
UPDATE "content_sources" 
SET "is_user_provided" = false, "authority_score" = 0.8 
WHERE "source_type" IN ('POST', 'RECOMMENDATION');

UPDATE "embedding_chunks" 
SET "authority_score" = 0.8 
WHERE "source_type" IN ('POST', 'RECOMMENDATION');

-- Backfill: All existing chunks are active
UPDATE "embedding_chunks" SET "is_active" = true WHERE "is_active" IS NULL;


-- AddForeignKey
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embedding_chunks" ADD CONSTRAINT "embedding_chunks_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embedding_chunks" ADD CONSTRAINT "embedding_chunks_content_source_id_fkey" FOREIGN KEY ("content_source_id") REFERENCES "content_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_chunk_usage" ADD CONSTRAINT "post_chunk_usage_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_chunk_usage" ADD CONSTRAINT "post_chunk_usage_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "embedding_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
