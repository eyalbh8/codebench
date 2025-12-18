-- @param {String} $1:topicId
-- @param {String} $2:accountId
-- @param {Int} $9:limit
-- @param {Int} $10:offset

SELECT
  prompt,
  ARRAY_AGG(
    JSON_BUILD_OBJECT(
      'entity', entity,
      'company_sources', company_sources
    )
  ) AS entities,
  COUNT(*) OVER() AS total_count
FROM results
WHERE topic = $1
  AND account_id = $2::uuid
  AND scan_id = ANY($3::uuid[])
  AND ($4::boolean[] IS NULL OR is_company_in_prompt = ANY($4::boolean[]))
  AND ($5::text[] IS NULL OR region = ANY($5))
  AND ($6::text[] IS NULL OR topic = ANY($6))
  AND ($7::text[] IS NULL OR prompt_type = ANY($7))
  AND ($8::text[] IS NULL OR provider = ANY($8::text[]))
  AND ($11::uuid[] IS NULL OR prompt_id = ANY($11::uuid[]))
GROUP BY prompt
LIMIT $9
OFFSET $10;