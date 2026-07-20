## Add Calls button to desktop navigation

The "Calls" section is already built and accessible on mobile via the hamburger menu, but it is missing from the desktop top-bar navigation. Desktop users currently have no visible way to reach `/calls`.

### Change
Update `src/components/layout/navigation/DesktopNavigation.tsx` to add a "Calls" button with the `Phone` icon, placed between "Prospect Now" and "Manage Users" to match the order used in mobile navigation (`NavigationItems.tsx`).

### Verification
- Desktop header shows the new Calls button.
- Clicking it navigates to `/calls`.
- Mobile navigation remains unchanged.
