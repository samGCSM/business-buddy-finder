

## Split Header Into Two Rows

### Problem
Currently everything is jammed into one row. You want two distinct rows:
- **Row 1**: User dropdown + Territory dropdown (filters only)
- **Row 2**: Add Prospect button, Manage Territories button, Search prospects input, then the right-side action buttons (Bulk Upload, Enrich, Delete, Map, Export)

### File: `src/components/prospects/ProspectHeader.tsx`

Restructure the JSX from one single flex row into two stacked rows:

**Row 1** (filters):
- `UserProspectFilter` (admin/supervisor only)
- Territory `Select` dropdown

**Row 2** (actions + search):
- Left side: Add Prospect button, TerritoryManager button, Search input
- Right side: Bulk Upload, Enrich, Delete, Map, Export buttons

The outer container changes from a single `flex-row` to a vertical `space-y-4` wrapper containing two rows.

### No other files change
`ProspectContent.tsx` already passes all necessary props -- no changes needed there.

