-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "account_id" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "user_agent" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "bot_name" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "screen" TEXT,
    "platform" TEXT,
    "language" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_account_id_idx" ON "analytics_events"("account_id");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_source_idx" ON "analytics_events"("source");

-- CreateIndex
CREATE INDEX "analytics_events_bot_name_idx" ON "analytics_events"("bot_name");

-- CreateIndex
CREATE INDEX "analytics_events_country_idx" ON "analytics_events"("country");
