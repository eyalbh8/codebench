-- @param {String} $3:accountId
select count(distinct (prompt, provider) ) as appearances_count, entity, scan_id as scanId, timestamp as runDate, topic,
  rank() over (partition by scan_id, topic order by count(distinct (prompt, provider)) desc) as rank
from results
where entity = Any($1) and scan_id = Any($2::uuid[]) and account_id = $3::uuid
    AND ($4::boolean[] IS NULL OR is_company_in_prompt = Any($4::boolean[]))
    AND ($5::text[] IS NULL OR region = Any($5))
    AND ($6::text[] IS NULL OR topic = Any($6))
    AND ($7::text[] IS NULL OR prompt_type = Any($7))
    AND ($8::text[] IS NULL OR provider = Any($8::text[]))
    AND ($9::uuid[] IS NULL OR prompt_id = Any($9::uuid[]))

group by entity, scan_id, timestamp, topic
