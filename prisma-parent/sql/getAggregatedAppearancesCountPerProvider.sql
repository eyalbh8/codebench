-- @param {String} $3:accountId
-- @param {Int} $9:promptsCount
-- @param {Float} $10:threshold
WITH scan_ids AS (
  SELECT unnest($2::uuid[]) AS scan_id
),
provider_counts AS (
  SELECT r.provider, r.scan_id, count(distinct (r.prompt, r.provider)) AS provider_prompt_count
  FROM results r
  JOIN scan_ids rid ON r.scan_id = rid.scan_id
  WHERE r.account_id = $3::uuid
    AND ($4::boolean[] IS NULL OR r.is_company_in_prompt = ANY($4::boolean[]))
    AND ($5::text[] IS NULL OR r.region = ANY($5))
    AND ($6::text[] IS NULL OR r.topic = ANY($6))
    AND ($7::text[] IS NULL OR r.prompt_type = ANY($7))
    AND ($8::text[] IS NULL OR r.provider = ANY($8::text[]))
    AND ($11::uuid[] IS NULL OR r.prompt_id = ANY($11::uuid[]))
  GROUP BY r.provider, r.scan_id
  HAVING count(distinct (r.prompt, r.provider))::float8 / $9 * 100 > $10
)
SELECT 
  count(distinct (r.prompt, r.provider)) AS appearances_count,
  r.entity,
  r.scan_id AS runId,
  r.timestamp AS runDate,
  r.provider,
  rank() OVER (PARTITION BY r.scan_id, r.provider ORDER BY count(distinct (r.prompt, r.provider)) DESC) AS rank
FROM results r
JOIN scan_ids rid ON r.scan_id = rid.scan_id
JOIN provider_counts pc ON r.provider = pc.provider AND r.scan_id = pc.scan_id
WHERE r.entity = $1
  AND r.account_id = $3::uuid
  AND ($4::boolean[] IS NULL OR r.is_company_in_prompt = ANY($4::boolean[]))
  AND ($5::text[] IS NULL OR r.region = ANY($5))
  AND ($6::text[] IS NULL OR r.topic = ANY($6))
  AND ($7::text[] IS NULL OR r.prompt_type = ANY($7))
  AND ($8::text[] IS NULL OR r.provider = ANY($8::text[]))
  AND ($11::uuid[] IS NULL OR r.prompt_id = ANY($11::uuid[]))
GROUP BY r.entity, r.scan_id, r.timestamp, r.provider
ORDER BY appearances_count DESC;