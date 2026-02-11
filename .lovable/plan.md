

## Remove Sticky Columns and Fix Table Scrolling

The sticky positioning on the Actions column (and Business Name column) is causing layout conflicts with the dual-scrollbar Table component, making things harder to use on mobile/tablet instead of easier. The fix is simple: remove all sticky column styling so the table scrolls naturally.

### Changes

**File: `src/components/prospects/ProspectTableHeader.tsx`**
- Remove `sticky right-0 bg-white z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]` from the Actions `TableHead` (line 58)
- Remove `sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]` from the Business Name `TableHead` (line 40), keep only the width classes

**File: `src/components/prospects/ProspectTableRow.tsx`**
- Remove `sticky right-0 bg-white z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]` from the Actions `TableCell` (line 102)
- The `BusinessNameCell` component may also have sticky styling -- remove it there too if present

The table already has `overflow-x-auto` on its container and `min-w-[1200px]` on the table element, so horizontal scrolling will work naturally on all screen sizes without any sticky columns getting in the way.

