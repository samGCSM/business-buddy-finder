

## Move Territory Dropdown Next to User Dropdown

### Current Layout
The page has two rows:
- Row 1: User dropdown + Territory dropdown (lines 70-96 in ProspectContent.tsx)
- Row 2: ProspectHeader (Add Prospect, Manage Territories, Search, Enrich, etc.)

### Change
Remove the separate first row and move the territory dropdown into the ProspectHeader row, right after the user filter. This puts everything on one row and eliminates the extra vertical space.

### File: `src/components/prospects/ProspectContent.tsx`
- Remove the entire `<div className="flex items-center justify-between">` block (lines 70-96) containing the territory Select
- Pass `selectedTerritory`, `setSelectedTerritory`, `territories`, `userRole`, `supervisedUsers`, `currentUser`, and `onUserSelect` as props to `ProspectHeader`

### File: `src/components/prospects/ProspectHeader.tsx`
- Accept new props: `selectedTerritory`, `onTerritoryChange`, `territories`, `userRole`, `supervisedUsers`, `currentUser`, `onUserSelect`
- Add the `UserProspectFilter` and territory `Select` dropdown at the beginning of the left-side controls (before Add Prospect button)
- Import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` and `UserProspectFilter`

### Result
One single row containing: [User Dropdown] [Territory Dropdown] [Add Prospect] [Manage Territories] [Search] ... [action buttons on the right]

