select
  provider,
  purpose,
  status,
  model,
  count(*)                                                  as number_of_rows,
  coalesce(sum((usage ->> 'prompt_tokens')::bigint), 0)     as prompt_tokens,
  coalesce(sum((usage ->> 'completion_tokens')::bigint), 0) as completion_tokens
from prompt_responses
where timestamp >= $1
  and timestamp <= $2
  and ($3::uuid is null or account_id = $3::uuid)
group by provider, purpose, status, model;