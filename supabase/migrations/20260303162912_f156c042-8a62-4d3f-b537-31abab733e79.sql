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
        ELSE true
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