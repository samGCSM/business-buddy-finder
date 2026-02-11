

## Move Search Input Next to Manage Territories Button

### Change

Move the search input from its current location (top of `ProspectContent`, next to the territory filter dropdown) to `ProspectHeader`, placed immediately to the right of the "Manage Territories" button.

### Files Changed

**`src/components/prospects/ProspectContent.tsx`**
- Remove the search input JSX (the `<div className="relative">` block with the Search icon and Input)
- Keep the `searchQuery` state and filtering logic
- Pass `searchQuery` and `setSearchQuery` as props to `ProspectHeader`

**`src/components/prospects/ProspectHeader.tsx`**
- Accept new props: `searchQuery: string` and `onSearchChange: (query: string) => void`
- Add the search input immediately after the `TerritoryManager` button (inside the left-side `div` on line 74)
- Import `Input` from `@/components/ui/input` and `Search` from `lucide-react`

### Result

The search bar will sit right next to the "Manage Territories" button on the left side of the header row, alongside the "Add Prospect" button -- keeping all primary controls together.
