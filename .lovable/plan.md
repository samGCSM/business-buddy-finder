

## Add Prospect Search + Tighten Table Columns

### 1. Prospect Search Input

Add a search input next to the territory filter dropdown in `ProspectContent.tsx`. It will filter the prospect list by matching the search term against `business_name`, `email`, `owner_name`, `phone_number`, and `business_address` (case-insensitive).

**File: `src/components/prospects/ProspectContent.tsx`**
- Add a `searchQuery` state variable
- Import `Input` from `@/components/ui/input` and `Search` icon from `lucide-react`
- Place a search input with a search icon next to the territory dropdown
- Apply search filtering after territory filtering so both filters work together

### 2. Tighten Table Column Widths and Padding

Reduce padding and constrain widths on several columns to make the table more compact.

**File: `src/components/ui/table.tsx`**
- Reduce default `TableCell` padding from `p-4` to `px-2 py-2` and add `text-sm`
- Reduce `TableHead` padding from `px-4` to `px-2`

**File: `src/components/prospects/ProspectTableHeader.tsx`**
- Add max-width constraints to specific columns:
  - Notes: `w-[60px]`
  - Email: `max-w-[150px]`
  - Location Type: `max-w-[100px]`
  - Rating: `w-[80px]`
  - Reviews: `w-[80px]`
- Shrink the sort button padding slightly

**File: `src/components/prospects/table/BasicInfoCell.tsx`**
- Add `truncate` and `max-w` classes so long text is truncated with ellipsis instead of expanding the column

**File: `src/components/prospects/table/ProspectNotesCell.tsx`**
- Constrain the notes cell width

---

### Technical Details

**Files modified:**
- `src/components/prospects/ProspectContent.tsx` -- add search state, input UI, and filtering logic
- `src/components/ui/table.tsx` -- reduce default cell/head padding
- `src/components/prospects/ProspectTableHeader.tsx` -- add width constraints to specific columns
- `src/components/prospects/table/BasicInfoCell.tsx` -- add truncation
- `src/components/prospects/table/ProspectNotesCell.tsx` -- constrain width

**Search behavior:**
- Case-insensitive partial match
- Searches across: business_name, email, owner_name, phone_number, business_address
- Combines with existing territory filter (both filters apply)
- Clears when user empties the input

**Column width targets:**
- Notes: ~60px (icon only)
- Email: max 150px with truncation
- Location Type: max 100px
- Rating: ~80px
- Reviews: ~80px
- All cells: reduced horizontal padding from 16px to 8px
