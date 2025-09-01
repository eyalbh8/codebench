-- @param {String} $1:accountId
WITH url_counts AS (
  SELECT
    regexp_replace(
      regexp_replace(
        regexp_replace(elem ->> 'url', '#.*$', ''),
        -- Remove fragments (#section)
        '[?&](utm_source|utm_medium|utm_campaign|utm_term|utm_content|utm_id|fbclid|gclid|msclkid|yclid|mc_cid|mc_eid|ref|session_id|_ga|_gid|campaign_id|ad_id|adset_id)=[^&#]*',
        '',
        'g' -- Remove tracking parameters
      ),
      '[?&/]+$',
      '' -- Remove trailing ?, &, /
    ) AS url,
    regexp_replace(
      elem ->> 'url',
      '^https?://(www\.)?([^/]+).*',
      '\2'
    ) AS domain,
    COUNT(DISTINCT (prompt, provider)) AS prompt_count,
    scan_id,
    timestamp as runDate
  FROM results,
  LATERAL unnest(company_sources) AS elem
  WHERE account_id = $1::uuid
    AND entity = Any($2)
    AND regexp_replace(elem->>'url', '^https?://(www\.)?([^/]+).*', '\2') != Any($3)
    AND ($4::boolean[] IS NULL OR is_company_in_prompt = Any($4::boolean[]))
    AND ($5::text[] IS NULL OR region = Any($5))
    AND ($6::text[] IS NULL OR topic = Any($6))
    AND ($7::text[] IS NULL OR prompt_type = Any($7))
    AND ($8::text[] IS NULL OR provider = Any($8::text[]))
    AND ($9::uuid[] IS NULL OR prompt_id = ANY($9::uuid[]))
    AND elem->>'url' ~* '^(https?)://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(/.*)?$'

  GROUP BY elem->>'url', scan_id, timestamp
)

SELECT 
  domain AS matched_domain,
  SUM(prompt_count) AS appearances_count,
  scan_id AS scanId,
  runDate,
  ARRAY_AGG(
    jsonb_build_object('url', url, 'promptCount', prompt_count)
  ) AS urls_with_counts
FROM url_counts
GROUP BY domain, scan_id, runDate
ORDER BY appearances_count DESC;
