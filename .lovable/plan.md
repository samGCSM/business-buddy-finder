## Sales Call Management for Gulf Coast Supply

Adds a new "Calls" section to the app for weekly account call planning, with spreadsheet import, manual entry, per-salesperson dashboards, and automatic rollover of uncalled accounts.

### 1. Database changes (single migration)

Extend existing `users` table (no new profiles table):
- Add `territory text`, `region text` (nullable). Existing `role` and `type` columns are reused ('admin' | 'manager' | 'salesperson' via existing role field).

New tables (all with RLS + GRANTs to authenticated/service_role):

- `accounts`
  - `id uuid pk`, `customer_number text unique not null` (text preserves leading zeros)
  - `account_name text`, `region text`, `territory text`
  - `assigned_salesperson_id int references users(id)` (nullable → Unassigned)
  - `date_last_sale date`, `priority text default 'normal'`, `notes text`
  - `source text` ('spreadsheet_import' | 'manual'), `active bool default true`
  - timestamps

- `import_batches`
  - `id uuid pk`, `file_name`, `uploaded_by int → users`, `uploaded_at`
  - `total_rows`, `created_count`, `updated_count`, `skipped_count`, `error_count`, `notes text`, `errors jsonb`

- `call_tasks`
  - `id uuid pk`, `account_id → accounts`, `assigned_salesperson_id → users`
  - `territory text`, `week_start_date date` (Monday of week)
  - `status text` ('not_called' | 'called' | 'follow_up_needed' | 'no_answer' | 'left_voicemail' | 'bad_number' | 'sold' | 'do_not_call')
  - `priority text`, `rollover_count int default 0`
  - `due_date date`, `completed_at timestamptz`, timestamps
  - Unique index on (account_id, week_start_date)

- `call_notes`
  - `id uuid pk`, `call_task_id → call_tasks`, `account_id`, `salesperson_id`
  - `note text`, `outcome text`, `next_follow_up_date date`, `created_at`

RPC: `roll_over_and_seed_week(p_salesperson_id int, p_week_start date)` — Security-definer function that:
1. For each prior-week task with status `not_called` for this salesperson: update `week_start_date = p_week_start`, increment `rollover_count`.
2. For any `follow_up_needed` task whose `next_follow_up_date` falls in this week: create/upsert a task for this week.
3. Ensure every active `accounts` row assigned to this salesperson has a `call_tasks` row for `p_week_start` (create with status `not_called` if missing) — first-time onboarding.

### 2. Spreadsheet import (admin)

Edge function `import-accounts` (verify_jwt=false, in-code auth check):
- Accepts base64 xlsx/csv payload + salesperson email.
- Parses with SheetJS (`xlsx` npm). Forward-fills Region and Territory Final down blank rows.
- Reads Customer # as text preserving leading zeros.
- Row validation: missing customer #, missing name, invalid date → recorded in `errors` jsonb; row skipped.
- Upsert logic keyed on `customer_number`:
  - Exists → update account_name, region, territory, date_last_sale.
  - New → insert; auto-assign `assigned_salesperson_id` by matching `users.territory = accounts.territory` (else null).
- Writes one `import_batches` row with all counts.
- Returns a preview (first 20 parsed rows + dedupe stats) if `?preview=1`; otherwise commits.

UI: `/calls/import` (admin only)
- Upload file → shows preview modal (new / updated / skipped counts + first 20 rows + errors list).
- Confirm → commits and shows batch results.
- Batch history table below.

### 3. Manual account entry

`/calls/accounts` (admin + manager):
- Table of all accounts with search, region/territory filter, assigned-salesperson filter, and an "Unassigned" quick filter.
- "Add Account" dialog with fields: Customer #, Account Name, Region, Territory, Assigned Salesperson (users dropdown filtered by role=salesperson), Date Last Sale, Priority, Notes.
- Row actions: Edit, Reassign, Deactivate.

### 4. This Week's Calls (salesperson)

`/calls` — primary page for salespeople:
- On load: compute current week's Monday, call `roll_over_and_seed_week` RPC for the logged-in user, then fetch `call_tasks` for that week joined with `accounts`.
- Table columns: Customer #, Account Name, Date Last Sale, Status (dropdown — changes status and stamps `completed_at` when terminal), Priority, Last Call Date, Next Follow-Up, Rollover count, Notes button.
- Notes drawer: shows all `call_notes` for the account; form to add note with outcome + optional next follow-up date.
- "Add to Call List" button: pick an active account (typeahead) → creates a `call_tasks` row for this week.
- Filters: status, priority, rolled-over-only.

### 5. Salesperson dashboard widgets

New tiles surfaced on `/calls` and mirrored on `/` (Home):
- This Week's Calls (count)
- Overdue Calls (past week, status still not_called or no_answer)
- Follow-Ups Due This Week
- Calls Completed This Week
- Accounts Not Called Yet
- Accounts Rolled Over (this week, rollover_count > 0)
- Sold / Reactivated (status='sold' in current week)

Backed by a single RPC `get_calls_dashboard(p_user_id int)` returning all counts in one round trip.

### 6. Prospect Now → Call Log quick-add

On the existing Prospects table, add a row action "Add to Call Log":
- Prompts for/creates an `accounts` row using the prospect's `business_name` (customer # auto-generated as `P-<prospect id short>` when none exists) and creates a `call_tasks` row for the current week.
- Also allows setting an optional next_follow_up_date to schedule for a future week instead.

### 7. Navigation

- Add "Calls" to `NavigationItems` (visible to all authenticated users).
- Sub-routes: `/calls` (This Week), `/calls/accounts` (all accounts, admin/manager), `/calls/import` (admin).
- Home dashboard: add a "This Week's Calls" widget (top 5 not-called for current user) with a "View all" link to `/calls`.

### 8. Access rules (RLS)

- `accounts`, `call_tasks`, `call_notes`, `import_batches`: RLS enabled.
- Salesperson: can read/update rows where they are the assigned salesperson (accounts, call_tasks, call_notes they own).
- Manager: can read all rows within their `region`, update call_tasks in their region.
- Admin: full access.
- Enforcement uses `public.current_user_id()` (already exists) plus a new `public.current_user_role()` helper.

### Technical notes

- Week start = Monday, computed in SQL with `date_trunc('week', now())::date`.
- Customer # kept as `text` everywhere — no numeric parsing on import.
- Territory matching for auto-assignment is case-insensitive trimmed string equality.
- The rollover RPC is idempotent per (user, week) so it's safe to call every page load.
- No cron job in v1 (per your choice); we can add pg_cron later without schema changes.

### Files to create / modify

New:
- `supabase/functions/import-accounts/index.ts`
- `src/pages/calls/CallsThisWeek.tsx`, `AccountsAdmin.tsx`, `ImportAccounts.tsx`
- `src/components/calls/*` (CallTaskRow, StatusSelect, NotesDrawer, AddAccountDialog, ImportPreviewDialog, DashboardTiles, AddToCallLogButton)
- `src/hooks/useCallsDashboard.ts`, `useThisWeekCalls.ts`, `useAccounts.ts`

Modified:
- `src/App.tsx` (routes)
- `src/components/layout/navigation/NavigationItems.tsx`
- `src/pages/Home.tsx` (widget)
- `src/components/prospects/table/ProspectActions.tsx` (Add to Call Log)

### Out of scope for this pass

- Migrating login to Supabase Auth
- Automated pg_cron schedule (using on-demand rollover instead)
- Bulk-assign screen (auto-assign + per-row reassignment covers it)
