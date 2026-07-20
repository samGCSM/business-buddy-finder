
DROP POLICY IF EXISTS "accounts read" ON public.accounts;
DROP POLICY IF EXISTS "accounts write" ON public.accounts;
DROP POLICY IF EXISTS "import_batches admin" ON public.import_batches;
DROP POLICY IF EXISTS "call_tasks access" ON public.call_tasks;
DROP POLICY IF EXISTS "call_notes access" ON public.call_notes;

CREATE POLICY "accounts all" ON public.accounts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "import_batches all" ON public.import_batches FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "call_tasks all" ON public.call_tasks FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "call_notes all" ON public.call_notes FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_notes TO anon;
