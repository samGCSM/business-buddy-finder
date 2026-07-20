# Add Prospects to Calls Report

Let salespeople push a prospect (or many selected prospects) from the Prospect page onto their weekly Calls Report list.

## How it works

The Calls Report is driven by `call_tasks`, which require an `accounts` row (accounts have a unique `customer_number`). Prospects live in a separate `prospects` table with no customer number. To bridge them we auto-create a matching account for each prospect on first push, then create a call task for the current week.

### User-facing behavior

On the Prospect page:
- New row action button "Add to Calls" (phone icon) on each prospect row.
- New bulk button "Add to Calls Report" in the header, visible when one or more prospects are checkbox-selected (matches the existing bulk selection pattern used for Enrich/Export/Delete).

Both actions:
1. For each selected prospect, find-or-create an `accounts` row using the prospect's business name and address.
2. Insert a `call_tasks` row for the current week (Monday), assigned to the logged-in user, status `not_called`. Duplicates for the same account/week are skipped via the existing unique constraint.
3. Show a toast: "X added to Calls Report, Y already on this week's list."

### Account creation rules

For a prospect with no linked account:
- `customer_number`: `PR-<prospect.id first 8 chars>` (guarantees uniqueness, marks it as prospect-sourced).
- `account_name`: prospect.business_name.
- `territory`: prospect.territory (nullable).
- `assigned_salesperson_id`: current user id.
- `source`: `'prospect'`.
- `notes`: prospect.business_address (so the address travels over).

Matching an existing account uses `customer_number = 'PR-<id>'` so re-adding the same prospect reuses its account instead of duplicating.

## Files to change

- `src/components/prospects/table/ProspectActions.tsx` — add phone-icon button "Add to Calls".
- `src/components/prospects/ProspectTableRow.tsx` — wire the new action handler through.
- `src/components/prospects/ProspectsTable.tsx` — add `handleAddToCalls(ids: string[])`, pass single-row handler down, and expose a bulk button when `selectedIds.size > 0`.
- `src/components/prospects/ProspectHeader.tsx` — add "Add to Calls Report" bulk button next to existing bulk actions.
- New helper `src/services/callsFromProspects.ts` — `addProspectsToCalls(prospects, salespersonId)` that does find-or-create account + insert call_tasks (using existing `getWeekStart` and the `account_id,week_start_date` unique constraint).

No database migration needed; existing tables and constraints cover this.

## Out of scope

- No changes to the Calls Report page itself; new tasks appear automatically on next load.
- No back-link from an account back to its originating prospect beyond the `PR-<id>` customer number convention.
- No bulk selection changes in Bulk Search (this is Prospect page only, per the request).
