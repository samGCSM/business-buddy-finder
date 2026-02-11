

## Two-Part Plan

### Part 1: Immediate Data Transfer (one-time action)
Move all prospects from Tom Goins (id: 15, 59 prospects) and Olivia Wrozier (id: 25, 19 prospects) to Diane Frederick (id: 14, currently 113 prospects). This will be done by updating the `user_id` column on the prospects table directly. After transferring, both Tom and Olivia can be deleted from the users table.

### Part 2: Build "Delete User with Prospect Reassignment" Feature
When an admin clicks "Delete" on a user, instead of immediately deleting them, a dialog will appear that:
1. Shows how many prospects that user currently has
2. If they have prospects, asks the admin to pick another user to receive those prospects
3. If they have zero prospects, allows direct deletion
4. On confirm: reassigns all prospects to the chosen user, then deletes the user

---

### Technical Details

**Data migration (Part 1):**
- Run two SQL updates to set `user_id = 14` on all prospects where `user_id` is 15 or 25
- Delete users with id 15 and 25 from the users table

**New component: `DeleteUserDialog`**
- A confirmation dialog triggered from the existing Delete button in `UserTableRow.tsx`
- Fetches the prospect count for the user being deleted
- If count > 0, shows a dropdown to select the recipient user (filtered to exclude the user being deleted)
- On confirm, calls Supabase to:
  1. Update all prospects `SET user_id = [selected_user_id] WHERE user_id = [deleted_user_id]`
  2. Delete the user from the `users` table
  3. Refresh the user list

**Files to create:**
- `src/components/users/DeleteUserDialog.tsx` -- the reassignment dialog

**Files to modify:**
- `src/components/users/UserTableRow.tsx` -- replace direct delete with dialog trigger
- `src/components/users/UserActions.tsx` -- add `handleReassignAndDelete` function that does the prospect transfer then user deletion

