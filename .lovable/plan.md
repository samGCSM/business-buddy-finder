

## Fix: Dashboard Total Prospects Stuck at 1000

### Root Cause

Supabase/PostgREST has a default limit of 1000 rows per query. The dashboard fetches `select('*')` from prospects, which silently caps at 1000 rows. That's why Total Prospects shows exactly 1000 and New Prospects is also wrong (it's only counting within those 1000 rows).

The activity log counts (emails, face-to-face) are also potentially inaccurate for the same reason.

### Fix

Create a Supabase RPC function to do the counting server-side (no row limit), then call it from the dashboard hook.

**1. New database migration -- create RPC function `get_dashboard_metrics`**

```sql
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_user_id integer, p_user_type text, p_supervisor_id integer DEFAULT NULL)
RETURNS TABLE (
  total_prospects BIGINT,
  new_prospects BIGINT,
  emails_sent BIGINT,
  face_to_face BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_prospects AS (
    SELECT p.*
    FROM prospects p
    WHERE
      CASE
        WHEN p_user_type = 'user' THEN p.user_id = p_user_id
        WHEN p_user_type = 'supervisor' THEN
          p.user_id = p_user_id OR p.user_id IN (SELECT u.id FROM users u WHERE u.supervisor_id = p_user_id)
        ELSE true -- admin sees all
      END
  ),
  activity_counts AS (
    SELECT
      COUNT(*) FILTER (
        WHERE act->>'type' = 'Email'
        AND (act->>'timestamp')::timestamptz >= NOW() - INTERVAL '7 days'
      ) AS email_count,
      COUNT(*) FILTER (
        WHERE LOWER(act->>'type') = 'face to face'
        AND (act->>'timestamp')::timestamptz >= NOW() - INTERVAL '7 days'
      ) AS ftf_count
    FROM filtered_prospects fp,
    LATERAL unnest(fp.activity_log) AS act
  )
  SELECT
    (SELECT COUNT(*)::BIGINT FROM filtered_prospects),
    (SELECT COUNT(*)::BIGINT FROM filtered_prospects WHERE created_at > NOW() - INTERVAL '30 days'),
    COALESCE((SELECT email_count FROM activity_counts), 0)::BIGINT,
    COALESCE((SELECT ftf_count FROM activity_counts), 0)::BIGINT;
END;
$$;
```

**2. Update `src/hooks/useDashboardMetrics.ts`**

Replace the entire `select('*')` + client-side counting logic with a single RPC call:

```typescript
const { data, error } = await supabase.rpc('get_dashboard_metrics', {
  p_user_id: currentUser.id,
  p_user_type: currentUser.type,
});
```

Then map the response directly to the metrics state:
- `data[0].total_prospects` -> `totalProspects`
- `data[0].new_prospects` -> `newProspects`
- `data[0].emails_sent` -> `emailsSent`
- `data[0].face_to_face` -> `faceToFace`

This eliminates the 1000-row cap entirely and is also significantly faster.

### Files Changed
- **New migration**: Create `get_dashboard_metrics` RPC function
- **`src/hooks/useDashboardMetrics.ts`**: Replace client-side counting with RPC call

