# Pre-Publish Regression Checklist

## Core Routes & Navigation
- [ ] `/` (Guest Area) loads without errors
- [ ] `/browse` (Browse Hotels) loads and displays hotel list
- [ ] `/guest-account` (Guest Account) loads for authenticated users
- [ ] `/account-status` (Account Status) loads for authenticated users
- [ ] `/hotel-area` (Hotel Area) loads for invited/admin users
- [ ] `/admin` (Admin Panel) loads for admin users only
- [ ] All navigation links in header work correctly
- [ ] Mobile menu opens and closes properly

## Authentication & Authorization
- [ ] Login button triggers Internet Identity flow
- [ ] Logout clears all cached data and returns to guest view
- [ ] Admin-only routes show access denied for non-admin users
- [ ] Hotel Area shows invite gate for non-invited users
- [ ] Profile setup dialog appears for first-time users

## Account Status Page - Role-Based UI (Draft v53)
### Non-Admin Users
- [ ] Non-admin users do NOT see Troubleshooting section on Account Status page
- [ ] Non-admin users do NOT see Publishing & Deployment section on Account Status page
- [ ] Non-admin users do NOT see any #troubleshooting navigation or scroll-to links
- [ ] Account Status page subtitle for non-admin users does NOT mention troubleshooting or deployment tools
- [ ] Non-admin users see only: Account Status Panel and their profile information

### Admin Users
- [ ] Admin users DO see Troubleshooting section on Account Status page
- [ ] Admin users DO see Publishing & Deployment section on Account Status page
- [ ] Admin users can access #troubleshooting anchor and scroll-to functionality
- [ ] Account Status page subtitle for admin users mentions admin tools
- [ ] Admin users see all sections: Account Status Panel, Troubleshooting, Publishing & Deployment, Roadmap Planning, Admin Recovery, Pre-Publish Checklist

## Backend Stopped/Unavailable Scenario (IC0508)
### Navigation & Diagnostics
- [ ] All routes remain navigable when backend is stopped
- [ ] No infinite loading spinners on any page
- [ ] Diagnostics card appears on all authenticated routes when backend is unavailable
- [ ] Diagnostics card shows "Backend canister is stopped" message
- [ ] Canister ID is extracted and displayed (copyable) in diagnostics

### Diagnostics UI
- [ ] "Show raw technical details" toggle works and displays full error
- [ ] Principal ID is displayed and copyable
- [ ] Authenticated status is shown correctly
- [ ] All diagnostic information is in English

### Actions & Recovery
- [ ] "Retry Connection" button works and re-attempts backend connection
- [ ] "Hard Refresh" button clears cache and reloads page
- [ ] "Open Troubleshooting Tools" link navigates to Account Status page with #troubleshooting anchor (admin only)
- [ ] "Go to Account Status" button navigates to /account-status
- [ ] Troubleshooting section actions (Clear React Query Cache, Disable PWA Cache) work correctly (admin only)

### Access Control Warning
- [ ] Non-blocking access control warning appears when admin verification times out
- [ ] Warning does not prevent page content from rendering
- [ ] Warning includes retry action that works
- [ ] Page remains functional even with access control warning

## Guest Account & Booking Flow Tests
### Browse Hotels
- [ ] Hotel list loads and displays all visible hotels
- [ ] Country filter works correctly
- [ ] Testing mode toggle works (shows/hides dummy hotels)
- [ ] Hotel cards display logo, name, location correctly
- [ ] "View Rooms" dialog opens and shows room inventory
- [ ] "Make Booking" dialog opens with correct hotel context

### Booking Creation
- [ ] Room type selection is required and works
- [ ] Check-in date must be in future (tomorrow minimum)
- [ ] Check-out date must be after check-in date
- [ ] Guest count is required
- [ ] Booking submission succeeds for valid inputs
- [ ] Error messages are clear and actionable
- [ ] Success feedback is shown after booking creation

### Guest Account Page
- [ ] "Browse Hotels & Make a Booking" CTA card is prominent at top
- [ ] Profile tab shows user profile or setup form
- [ ] Bookings tab shows all user bookings with room type
- [ ] Stay History tab shows past stays
- [ ] Cancel action works for pending bookings
- [ ] Refresh button updates data without full page reload

## Hotel Area Tests (Invited/Admin Users)
### Hotel Profile
- [ ] Profile form loads existing profile data
- [ ] Logo upload works (preview, validation, save)
- [ ] All fields save correctly
- [ ] Classification dropdown works
- [ ] Location fields (address, map link) save correctly

### Room Inventory
- [ ] Room list displays all rooms
- [ ] Add room dialog works
- [ ] Edit room dialog pre-fills existing data
- [ ] Delete room works with confirmation
- [ ] Currency selection works (IDR, USD, EUR, SGD)
- [ ] Photo upload works (preview, validation)
- [ ] Price and promo fields save correctly

### Bookings Management
- [ ] All bookings for hotel are displayed
- [ ] Status filter works (All, Pending, Confirmed, Rejected, Cancelled)
- [ ] Room type is displayed for each booking
- [ ] Confirm action works for pending bookings
- [ ] Reject action works for pending bookings
- [ ] Booking details are complete and accurate

### Stay Recording
- [ ] Guest Principal ID input validates format
- [ ] Check-in/out date pickers work
- [ ] Stay record creation succeeds
- [ ] Success/error feedback is shown

### Subscription & Payment
- [ ] Payment instructions form loads and saves
- [ ] Instructions are shown to guests after booking

## Admin Panel Stability
### Panel Error Isolation
- [ ] If one admin panel fails, others remain accessible
- [ ] Error boundary catches panel-specific errors
- [ ] Retry action in error boundary works
- [ ] Error messages are in English

### Admin Panels
- [ ] Next Step Selector saves selection to localStorage
- [ ] Hotel Invite Panel generates tokens
- [ ] Hotel Invite Panel copies tokens and links
- [ ] Hotel Visibility Panel loads all hotels
- [ ] Hotel Visibility Panel toggle actions work
- [ ] Payment Review Panel loads all payment requests
- [ ] Bookings Panel loads all system bookings
- [ ] Admin Recovery section works (diagnostics, reset access)

### Admin Panel Loading States
- [ ] Initial load shows spinner
- [ ] Background refetch shows inline indicator
- [ ] Previously loaded data remains visible during refetch
- [ ] No flash of empty state during refetch

## PWA & Offline Behavior
### Service Worker Updates
- [ ] "New version available" toast appears when new SW is detected
- [ ] Clicking "Later" dismisses toast and does not show again for same version
- [ ] Clicking "Refresh Now" activates new SW and reloads page
- [ ] Toast does not reappear repeatedly for the same waiting SW
- [ ] No console spam from repeated update events

### Caching Strategy
- [ ] Navigation requests use network-first strategy when online
- [ ] Static assets (JS, CSS, images) are cached appropriately
- [ ] API/backend requests are not cached
- [ ] Offline fallback to cached app shell works
- [ ] No mixed old HTML/new asset states after deploy

### Post-Deploy Verification (Draft v53)
- [ ] After deploy, new build version is reflected in footer
- [ ] After deploy, UI updates correctly without stuck loading
- [ ] If stale assets persist, Troubleshooting actions resolve issue (admin only)
- [ ] Hard refresh loads new version successfully
- [ ] Disabling PWA cache and reloading resolves cache issues (admin only)
- [ ] Non-admin users do NOT see Troubleshooting section after deploy
- [ ] Non-admin users do NOT see Publishing & Deployment section after deploy

## Internationalization (i18n)
- [ ] Language switcher toggles between English and Indonesian
- [ ] All UI text updates when language changes
- [ ] Language preference persists across sessions
- [ ] No missing translation keys (no "undefined" text)

## Error Handling
- [ ] Timeout errors show actionable messages
- [ ] Testing mode errors are clear
- [ ] Hotel availability errors are specific
- [ ] Date validation errors are helpful
- [ ] Network errors show retry options
- [ ] All error messages are in English

## Performance & UX
- [ ] No unnecessary full page reloads
- [ ] Loading states are clear and bounded
- [ ] Mutations show inline loading indicators
- [ ] Success feedback is immediate
- [ ] No flash of incorrect content
- [ ] Mobile responsive on all pages
