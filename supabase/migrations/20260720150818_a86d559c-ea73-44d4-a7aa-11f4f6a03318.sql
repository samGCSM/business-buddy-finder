
-- 1. Extend users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS territory text,
  ADD COLUMN IF NOT EXISTS region text;

-- 2. Helper: current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.users
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_region()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT region FROM public.users
  WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1
$$;

-- 3. accounts
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_number text NOT NULL UNIQUE,
  account_name text NOT NULL,
  region text,
  territory text,
  assigned_salesperson_id bigint REFERENCES public.users(id) ON DELETE SET NULL,
  date_last_sale date,
  priority text NOT NULL DEFAULT 'normal',
  notes text,
  source text NOT NULL DEFAULT 'manual',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_accounts_salesperson ON public.accounts(assigned_salesperson_id);
CREATE INDEX idx_accounts_territory ON public.accounts(territory);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts read" ON public.accounts FOR SELECT TO authenticated USING (
  public.current_user_role() IN ('admin','manager')
  OR assigned_salesperson_id = public.current_user_id()
  OR (public.current_user_role() = 'manager' AND region = public.current_user_region())
);
CREATE POLICY "accounts write" ON public.accounts FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin','manager') OR assigned_salesperson_id = public.current_user_id())
  WITH CHECK (public.current_user_role() IN ('admin','manager') OR assigned_salesperson_id = public.current_user_id());

-- 4. import_batches
CREATE TABLE public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  uploaded_by bigint REFERENCES public.users(id),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  total_rows int DEFAULT 0,
  created_count int DEFAULT 0,
  updated_count int DEFAULT 0,
  skipped_count int DEFAULT 0,
  error_count int DEFAULT 0,
  notes text,
  errors jsonb DEFAULT '[]'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "import_batches admin" ON public.import_batches FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin','manager'))
  WITH CHECK (public.current_user_role() IN ('admin','manager'));

-- 5. call_tasks
CREATE TABLE public.call_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  assigned_salesperson_id bigint REFERENCES public.users(id) ON DELETE SET NULL,
  territory text,
  week_start_date date NOT NULL,
  status text NOT NULL DEFAULT 'not_called',
  priority text NOT NULL DEFAULT 'normal',
  rollover_count int NOT NULL DEFAULT 0,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, week_start_date)
);
CREATE INDEX idx_call_tasks_sp_week ON public.call_tasks(assigned_salesperson_id, week_start_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_tasks TO authenticated;
GRANT ALL ON public.call_tasks TO service_role;
ALTER TABLE public.call_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_tasks access" ON public.call_tasks FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin','manager') OR assigned_salesperson_id = public.current_user_id())
  WITH CHECK (public.current_user_role() IN ('admin','manager') OR assigned_salesperson_id = public.current_user_id());

-- 6. call_notes
CREATE TABLE public.call_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_task_id uuid REFERENCES public.call_tasks(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  salesperson_id bigint REFERENCES public.users(id) ON DELETE SET NULL,
  note text NOT NULL,
  outcome text,
  next_follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_call_notes_account ON public.call_notes(account_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_notes TO authenticated;
GRANT ALL ON public.call_notes TO service_role;
ALTER TABLE public.call_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_notes access" ON public.call_notes FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin','manager') OR salesperson_id = public.current_user_id())
  WITH CHECK (public.current_user_role() IN ('admin','manager') OR salesperson_id = public.current_user_id());

-- 7. updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER call_tasks_updated_at BEFORE UPDATE ON public.call_tasks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 8. Rollover + seed week
CREATE OR REPLACE FUNCTION public.roll_over_and_seed_week(p_salesperson_id bigint, p_week_start date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Roll forward uncalled prior-week tasks (update week_start unless a task already exists this week)
  UPDATE public.call_tasks ct
    SET week_start_date = p_week_start,
        rollover_count = ct.rollover_count + 1,
        updated_at = now()
  WHERE ct.assigned_salesperson_id = p_salesperson_id
    AND ct.week_start_date < p_week_start
    AND ct.status IN ('not_called','no_answer','left_voicemail')
    AND NOT EXISTS (
      SELECT 1 FROM public.call_tasks ct2
      WHERE ct2.account_id = ct.account_id AND ct2.week_start_date = p_week_start
    );

  -- Seed follow-ups whose next_follow_up_date falls in this week
  INSERT INTO public.call_tasks (account_id, assigned_salesperson_id, territory, week_start_date, status, priority)
  SELECT DISTINCT a.id, a.assigned_salesperson_id, a.territory, p_week_start, 'not_called', COALESCE(a.priority,'normal')
  FROM public.call_notes n
  JOIN public.accounts a ON a.id = n.account_id
  WHERE a.assigned_salesperson_id = p_salesperson_id
    AND n.next_follow_up_date >= p_week_start
    AND n.next_follow_up_date < p_week_start + INTERVAL '7 days'
  ON CONFLICT (account_id, week_start_date) DO NOTHING;

  -- Seed any active accounts for this salesperson that have no task yet this week (first onboarding)
  INSERT INTO public.call_tasks (account_id, assigned_salesperson_id, territory, week_start_date, status, priority)
  SELECT a.id, a.assigned_salesperson_id, a.territory, p_week_start, 'not_called', COALESCE(a.priority,'normal')
  FROM public.accounts a
  WHERE a.assigned_salesperson_id = p_salesperson_id
    AND a.active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.call_tasks ct WHERE ct.account_id = a.id
    )
  ON CONFLICT (account_id, week_start_date) DO NOTHING;
END; $$;

-- 9. Dashboard counts
CREATE OR REPLACE FUNCTION public.get_calls_dashboard(p_user_id bigint, p_week_start date)
RETURNS TABLE(
  this_week_calls bigint,
  overdue_calls bigint,
  follow_ups_due bigint,
  completed_this_week bigint,
  not_called_yet bigint,
  rolled_over bigint,
  sold_this_week bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM call_tasks WHERE assigned_salesperson_id = p_user_id AND week_start_date = p_week_start),
    (SELECT count(*) FROM call_tasks WHERE assigned_salesperson_id = p_user_id AND week_start_date < p_week_start AND status IN ('not_called','no_answer','left_voicemail')),
    (SELECT count(DISTINCT n.account_id) FROM call_notes n JOIN accounts a ON a.id=n.account_id
       WHERE a.assigned_salesperson_id = p_user_id AND n.next_follow_up_date >= p_week_start AND n.next_follow_up_date < p_week_start + INTERVAL '7 days'),
    (SELECT count(*) FROM call_tasks WHERE assigned_salesperson_id = p_user_id AND week_start_date = p_week_start AND status IN ('called','sold','do_not_call','bad_number')),
    (SELECT count(*) FROM call_tasks WHERE assigned_salesperson_id = p_user_id AND week_start_date = p_week_start AND status = 'not_called'),
    (SELECT count(*) FROM call_tasks WHERE assigned_salesperson_id = p_user_id AND week_start_date = p_week_start AND rollover_count > 0),
    (SELECT count(*) FROM call_tasks WHERE assigned_salesperson_id = p_user_id AND week_start_date = p_week_start AND status = 'sold');
END; $$;
