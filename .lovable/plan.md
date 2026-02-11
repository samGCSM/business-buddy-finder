

## Bulk Email Enrichment + Checkbox Selection for Prospects

### Overview

Two features for the Prospects page:

1. **Bulk Email Enrichment button** -- runs Hunter.io email lookup on all (or selected) prospects missing emails
2. **Checkbox selection** -- select individual rows or all rows, then use selection for Export, Map, Delete, or Bulk Enrich actions

---

### Feature 1: Checkbox Selection System

**Selection state lives in `ProspectsTable.tsx`** since it manages the sorted list and renders rows.

- Add `selectedIds: Set<string>` state
- Pass `selectedIds`, `onToggleSelect`, and `onToggleAll` down to header and rows

**`ProspectTableHeader.tsx`**
- Add a new first `<TableHead>` column with a Checkbox component
- Checkbox is checked when all visible prospects are selected, indeterminate when some are selected
- Clicking toggles select-all / deselect-all

**`ProspectTableRow.tsx`**
- Add a new first `<TableCell>` with a Checkbox
- Checked state driven by whether the prospect's ID is in `selectedIds`
- Clicking toggles that prospect in/out of selection

**`ProspectsTable.tsx`**
- Manage `selectedIds` state
- Pass selected prospect IDs up to parent via a new `onSelectionChange` callback
- Clear selection when prospects list changes

**`ProspectContent.tsx`**
- Receive `selectedIds` from `ProspectsTable`
- Pass selected prospects to `ProspectHeader` so the action buttons can operate on selection

**`ProspectHeader.tsx`**
- Update Export button: if prospects are selected, export only those; otherwise export all
- Update "Map These" button: if selected, map only those; otherwise map all with addresses
- Add a "Delete Selected" button that appears only when prospects are selected
- Button labels update to show count, e.g. "Export (5)" or "Export All"

### Feature 2: Bulk Email Enrichment

**New file: `src/hooks/useBulkEmailEnrichment.ts`**
- Hook that accepts a list of prospects
- Filters to those missing valid emails but having a website or business_name
- Iterates through them, calling the existing `enrich-prospect-email` edge function for each
- Adds a 500ms delay between calls to avoid rate limiting
- Tracks `isEnriching`, `progress` (current/total), and `foundCount`
- Updates each prospect in the DB as emails are found
- Shows toast with summary when complete

**`ProspectHeader.tsx`**
- Add a "Bulk Enrich Emails" button with a Zap icon
- Shows count of enrichable prospects, e.g. "Enrich Emails (12)"
- When prospects are selected, only enriches those selected that are missing emails
- Disabled while enrichment is in progress; shows progress text like "Enriching 3/12..."
- Calls `onBulkUploadSuccess` when done to refresh the list

---

### Technical Details

**New files:**
- `src/hooks/useBulkEmailEnrichment.ts`

**Modified files:**
- `src/components/prospects/ProspectTableHeader.tsx` -- add checkbox column
- `src/components/prospects/ProspectTableRow.tsx` -- add checkbox column
- `src/components/prospects/ProspectsTable.tsx` -- manage selection state, pass to children and parent
- `src/components/prospects/ProspectContent.tsx` -- bridge selection between table and header
- `src/components/prospects/ProspectHeader.tsx` -- add bulk enrich button, selection-aware actions

**Props flow:**

```text
ProspectContent
  |-- ProspectHeader (receives selectedProspects for context-aware actions)
  |-- ProspectsTable (manages selectedIds, reports via onSelectionChange)
        |-- ProspectTableHeader (select-all checkbox)
        |-- ProspectTableRow (per-row checkbox)
```

**Selection-aware behavior:**
- Export: selected only, or all if none selected
- Map These: selected with addresses, or all with addresses if none selected
- Delete: only appears when selection exists, deletes all selected with confirmation
- Bulk Enrich: selected missing emails, or all missing emails if none selected

