

## Fix: Enrich Emails Button Count Behavior

### Problem

The "Enrich Emails" button always shows a number (e.g., "Enrich Emails (2)") based on ALL prospects, even when none are selected. When prospects are selected, the count doesn't visually match the selection count like Export and Delete buttons do.

### Solution

Update the button label in `ProspectHeader.tsx` to follow the same pattern as Export and Map:

- **No selection**: Show "Enrich All (X)" where X is the count of all enrichable prospects
- **With selection**: Show "Enrich (X)" where X is the count of selected prospects that are enrichable

This makes the button behavior consistent with Export ("Export All" vs "Export (5)") and Map ("Map These (X)" vs "Map (X)").

### Technical Changes

**File: `src/components/prospects/ProspectHeader.tsx`**

Update the Enrich Emails button label (around line 93-96) to use selection-aware text:

- When not enriching:
  - No selection: `Enrich All (enrichableCount)` or just `Enrich Emails` if zero
  - With selection: `Enrich (enrichableCount)` showing only selected enrichable count
- The `enrichableCount` computation on line 70 already uses `actionProspects` which switches correctly between selected and all prospects, so counts are accurate -- the fix is purely in the label text to make it clear what scope is being acted on

