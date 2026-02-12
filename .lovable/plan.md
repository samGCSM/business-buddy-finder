

## Move Delete Button & Add Confirmation Dialog

### Changes

**File: `src/components/prospects/ProspectHeader.tsx`**

1. **Move the Delete button** -- Currently it sits between the Enrich button and the Map button (lines 163-169). Move it after the Export button (after line 181) so the order becomes: `Enrich | Map | Export | Delete`.

2. **Add confirmation dialog** -- Replace the `window.confirm()` call in `handleDeleteSelected` (line 79) with a proper `AlertDialog` from the existing UI components. The dialog will show:
   - Title: "Delete Prospects"
   - Description: "Are you sure you want to delete {count} selected prospect(s)? This action cannot be undone."
   - Cancel and Delete buttons

3. **Implementation approach**:
   - Import `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger` from `@/components/ui/alert-dialog`
   - Wrap the Delete button in an `AlertDialogTrigger` so clicking it opens the confirmation dialog instead of immediately deleting
   - Move the actual deletion logic into the `AlertDialogAction` onClick handler
   - Remove the `window.confirm()` call

