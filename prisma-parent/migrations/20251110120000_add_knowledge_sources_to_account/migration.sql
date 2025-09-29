-- Add knowledge_sources column to accounts table
ALTER TABLE "accounts"
ADD COLUMN "knowledge_sources" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

