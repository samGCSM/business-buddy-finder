

## Manage Users Table Improvements

### Changes Overview

**1. Hide the Email column**
Remove the Email column from both the header and rows to free up horizontal space.

**2. Supervisor column: show name instead of email**
The Supervisor column currently displays the supervisor's email. It will be changed to show `full_name` instead (falling back to email if no name is set).

**3. Fix "Searches (30d)" to show correct data**
Currently the table displays `user.totalSearches` which is a lifetime cumulative counter stored on the `users` table. This will be changed to `user.stats?.searches_last_30_days` which comes from the `user_stats` view and reflects actual 30-day activity. Most users will correctly show 0 since they haven't been active recently.

**4. Reduce column padding**
Shrink cell padding from `px-6 py-4` (rows) and `px-6 py-3` (headers) down to `px-3 py-2` so more columns fit without horizontal scrolling and the action buttons (Edit, Change Password, Delete) are visible without scrolling.

---

### Technical Details

**Files to modify:**

- **`src/components/users/UserTableHeader.tsx`**
  - Remove the Email header column
  - Change header padding from `px-6 py-3` to `px-3 py-2`

- **`src/components/users/UserTableRow.tsx`**
  - Remove the Email `<td>` (line 85-87)
  - Change `getSupervisorEmail()` to `getSupervisorName()` -- return `supervisor.full_name || supervisor.email` instead of just email
  - In the supervisor edit dropdown, show `full_name || email` for each option
  - Fix line 149: change `getNumericValue(user.totalSearches)` to `user.stats?.searches_last_30_days || 0`
  - Change all cell padding from `px-6 py-4` to `px-3 py-2`

- **`src/components/users/UserTable.tsx`**
  - Remove "email" from the sort field options since the column is hidden
