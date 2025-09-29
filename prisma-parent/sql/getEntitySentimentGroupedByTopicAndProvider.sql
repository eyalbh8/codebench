-- @param {String} $1:entityName
-- @param {String} $2:accountId
-- Get entity sentiment grouped by topic and provider
-- Only considers sentiment once per prompt per run
-- Business logic for sentiment calculation:
-- - negative + neutral = negative
-- - positive + neutral = positive
-- - negative + positive = mixed
WITH prompt_feel_aggregated AS (
    SELECT
        scan_id,
        prompt_id,
        topic,
        provider,
        entity,
        CASE
            WHEN COUNT(DISTINCT feel) = 1 THEN CASE
                WHEN MIN(feel) IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED') THEN MIN(feel)
                ELSE 'NEUTRAL'
            END
            WHEN COUNT(DISTINCT feel) = 2
            AND (
                'POSITIVE' = ANY(ARRAY_AGG(DISTINCT feel))
                AND 'NEUTRAL' = ANY(ARRAY_AGG(DISTINCT feel))
            ) THEN 'POSITIVE'
            WHEN COUNT(DISTINCT feel) = 2
            AND (
                'NEGATIVE' = ANY(ARRAY_AGG(DISTINCT feel))
                AND 'NEUTRAL' = ANY(ARRAY_AGG(DISTINCT feel))
            ) THEN 'NEGATIVE'
            WHEN COUNT(DISTINCT feel) = 2
            AND (
                'POSITIVE' = ANY(ARRAY_AGG(DISTINCT feel))
                AND 'NEGATIVE' = ANY(ARRAY_AGG(DISTINCT feel))
            ) THEN 'MIXED'
            WHEN COUNT(DISTINCT feel) = 3 THEN 'MIXED'
            ELSE 'NEUTRAL'
        END AS final_feel,
        MIN(timestamp) AS runDate
    FROM
        results
    WHERE
        entity = $1
        AND account_id = $2::uuid
        AND scan_id = ANY($3::uuid [])
        AND feel IS NOT NULL
        AND (
            $4::boolean [] IS NULL
            OR is_company_in_prompt = ANY($4::boolean [])
        )
        AND (
            $5::text [] IS NULL
            OR region = ANY($5)
        )
        AND (
            $6::text [] IS NULL
            OR topic = ANY($6)
        )
        AND (
            $7::text [] IS NULL
            OR prompt_type = ANY($7)
        )
        AND (
            $8::text[] IS NULL
            OR provider = ANY($8::text[])
        )
        AND (
            $9::uuid[] IS NULL
            OR prompt_id = ANY($9::uuid[])
        )
    GROUP BY
        scan_id,
        prompt_id,
        topic,
        provider,
        entity
)
SELECT
    topic,
    provider,
    final_feel AS feel,
    COUNT(*) AS count,
    scan_id AS runId,
    runDate
FROM
    prompt_feel_aggregated
GROUP BY
    topic,
    provider,
    final_feel,
    scan_id,
    runDate
ORDER BY
    topic,
    provider,
    final_feel;