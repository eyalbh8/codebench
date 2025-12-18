with tracked_urls as (
  select
    tr.id as tracked_recommendation_id,
    tr.created_at as implementation_date,
    substring(url FROM '^(?:[a-zA-Z]+://)?([^/:?#]+)') || COALESCE(substring(url FROM '^(?:[a-zA-Z]+://)?[^/]+(/[^?#]*)'), '') as tracked_url
  from
    tracked_recommendations tr
    cross join lateral unnest(tr.urls) as url
  where
    tr.account_id = $1::uuid
    and array_length(tr.urls, 1) > 0
),
all_scans as (
  select
    r.id as scan_id,
    r.account_id,
    r.created_at as run_date
  from
    scans r
  where
    r.account_id = $1::uuid
),
tracked_scans as (
  select
    tu.tracked_recommendation_id,
    tu.implementation_date,
    ar.scan_id,
    ar.run_date,
    tu.tracked_url
  from
    tracked_urls tu
    join all_scans ar
      on ar.run_date >= (
        select coalesce(
          (select run_date from all_scans 
           where run_date < (select MIN(implementation_date) from tracked_urls)
           order by run_date desc limit 1),
          (select MIN(implementation_date) from tracked_urls)
        )
      )
),
appearances as (
  select
    tr.tracked_recommendation_id,
    tr.implementation_date,
    tr.scan_id,
    tr.run_date,
    count(case
      when elem is not null
        and substring(elem ->> 'url' FROM '^(?:[a-zA-Z]+://)?([^/:?#]+)') ||
            COALESCE(substring(elem ->> 'url' FROM '^(?:[a-zA-Z]+://)?[^/]+(/[^?#]*)'), '') = tr.tracked_url
      then 1
      else null
    end)::INTEGER as appearances_count
  from
    tracked_scans tr
    left join results
      on results.scan_id = tr.scan_id and results.account_id = $1::uuid
    left join lateral (
      select unnest(results.company_sources)::jsonb as elem
      union all
      select unnest(results.url_sources)::jsonb
    ) as elem on results.id is not null
  group by
    tr.tracked_recommendation_id,
    tr.implementation_date,
    tr.scan_id,
    tr.run_date
),
closest_run as (
  select
    tracked_recommendation_id,
    run_date as closest_run_date
  from (
    select
      tracked_recommendation_id,
      run_date,
      implementation_date,
      row_number() over (
        partition by tracked_recommendation_id
        order by run_date desc
      ) as rn
    from appearances
    where run_date < implementation_date
  ) t
  where rn = 1
),
last_average_cte as (
  select
    a.tracked_recommendation_id,
    coalesce(a.appearances_count, 0)::INTEGER as last_average
  from appearances a
  join closest_run cr
    on a.tracked_recommendation_id = cr.tracked_recommendation_id
   and a.run_date = cr.closest_run_date
),
analytics_calculations as (
  select
    a.tracked_recommendation_id,
    coalesce(l.last_average, 0) as last_average,
    coalesce(
      round(avg(a.appearances_count) filter (
        where a.run_date >= a.implementation_date
      ), 1),
      0
    ) as new_average,
    coalesce(
      sum(a.appearances_count) filter (
        where a.run_date >= a.implementation_date
      ),
      0
    )::INTEGER as total_appearances_after_implementation
  from appearances a
  left join last_average_cte l
    on l.tracked_recommendation_id = a.tracked_recommendation_id
  group by a.tracked_recommendation_id, l.last_average
)
select
  tracked_recommendation_id,
  last_average,
  new_average,
  case
    when last_average = 0 then null
    else ROUND(((new_average::decimal - last_average::decimal) / ABS(last_average::decimal)) * 100, 0)
  end as trend_percentage,
  total_appearances_after_implementation
from analytics_calculations;
