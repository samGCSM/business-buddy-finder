

## Make Prospects Page Responsive for Mobile and Tablet

### Problem
The header buttons overflow and get cut off on smaller screens, and the table doesn't scroll far enough to reveal the Actions column (Edit/Delete) on tablets.

### Changes

#### 1. `src/components/prospects/ProspectHeader.tsx` -- Responsive header rows

**Row 1 (Filters):** Change the territory `SelectTrigger` from fixed `w-[200px]` to `w-full sm:w-[200px]` so it fills the width on mobile. Wrap the row so items stack vertically on very small screens.

**Row 2 (Actions + Search):**
- Make the search input responsive: `w-full sm:w-[220px]` instead of fixed `w-[220px]`
- On mobile, both the left group (Add, Territories, Search) and right group (Bulk Upload, Enrich, Map, Export) will stack vertically since `flex-col sm:flex-row` is already in place
- Shrink button text on mobile by hiding labels and showing only icons on small screens using `hidden sm:inline` on button text and keeping icons always visible
- Action buttons in the right group: use `w-full sm:w-auto` so they fill the row on mobile

#### 2. `src/components/prospects/ProspectsTable.tsx` -- Fix table scroll

- Add `min-w-[1200px]` to the `<Table>` element so the table has a guaranteed minimum width, ensuring the horizontal scroll container always allows scrolling to the Actions column
- The existing `overflow-x-auto` wrapper will then properly enable full horizontal scrolling on tablet/mobile

#### 3. `src/components/prospects/table/ProspectActions.tsx` -- Make Actions column sticky

- Make the Actions column sticky on the right side (mirroring how Business Name is sticky on the left) by adding `sticky right-0 bg-white z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]` to the Actions `TableCell` in `ProspectTableRow.tsx`
- Apply matching sticky styling to the Actions `TableHead` in `ProspectTableHeader.tsx`

This ensures Edit and Delete are always visible regardless of scroll position.

### Technical Details

**ProspectHeader.tsx:**
- Territory select: `w-[200px]` becomes `w-full sm:w-[200px]`
- Search input: `w-[220px]` becomes `w-full sm:w-[220px]`
- Right-side action buttons: add `text-xs sm:text-sm` for smaller text on mobile

**ProspectsTable.tsx (line 110):**
- Add `className="min-w-[1200px]"` to `<Table>`

**ProspectTableHeader.tsx (line 58):**
- Actions TableHead: add `sticky right-0 bg-white z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]`

**ProspectTableRow.tsx (Actions TableCell):**
- Add `sticky right-0 bg-white z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]` to the Actions cell wrapper

### Files Modified
- `src/components/prospects/ProspectHeader.tsx`
- `src/components/prospects/ProspectsTable.tsx`
- `src/components/prospects/ProspectTableHeader.tsx`
- `src/components/prospects/ProspectTableRow.tsx`

