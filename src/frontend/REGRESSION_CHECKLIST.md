# Pre-Publish Regression Checklist

## Core Routes & Navigation
- [ ] `/` (Guest Area) loads without errors
- [ ] `/browse` (Browse Hotels) loads and displays hotels correctly
- [ ] `/hotel` (Hotel Area) loads for invited users
- [ ] `/guest-account` loads for authenticated users
- [ ] `/account` (Account Status) loads for authenticated users
- [ ] `/admin` (Admin Panel) loads for admin users
- [ ] All navigation links work correctly
- [ ] Mobile menu opens and closes properly

## Authentication & Authorization
- [ ] Login with Internet Identity works
- [ ] Logout clears all cached data
- [ ] Profile setup dialog appears for first-time users
- [ ] Admin users can access Admin Panel
- [ ] Non-admin users see access denied on Admin Panel
- [ ] Invited users can access Hotel Area
- [ ] Non-invited users see invite gate on Hotel Area

## Critical Query Behavior
- [ ] All queries use `placeholderData: (previousData) => previousData` to preserve data during refetch
- [ ] Loading states only show `true` during initial load, not during background refetch
- [ ] Error states are handled gracefully with retry actions
- [ ] Timeout protection is in place for all backend calls (10-15s)
- [ ] Query invalidation works correctly after mutations

## Backend Stopped/Unavailable Scenario (IC0508)
### Navigation & Diagnostics
- [ ] Navigate to `/` (Guest Area) with stopped backend → shows diagnostics card (no blank screen)
- [ ] Navigate to `/browse` (Browse Hotels) with stopped backend → shows diagnostics card (no blank screen)
- [ ] Navigate to `/hotel` (Hotel Area) with stopped backend → shows diagnostics card (no blank screen)
- [ ] Navigate to `/guest-account` with stopped backend → shows diagnostics card (no blank screen)
- [ ] Navigate to `/account` (Account Status) with stopped backend → shows diagnostics card (no blank screen)
- [ ] Navigate to `/admin` (Admin Panel) with stopped backend → shows diagnostics card (no blank screen)

### Diagnostics UI
- [ ] Stopped canister is detected and shows user-friendly message: "Backend is currently unavailable (canister stopped)"
- [ ] Canister ID is extracted and displayed in a copyable field (when present in error)
- [ ] Raw technical details are hidden by default
- [ ] "Show raw technical details" toggle expands/collapses raw error message
- [ ] No infinite loading states occur (actor initialization bounded by 15s timeout)
- [ ] Previously loaded data remains visible during backend issues (where applicable)

### Actions & Recovery
- [ ] "Retry Connection" button is available and functional
- [ ] "Hard Refresh Page" button is available (stopped-canister only) and reloads the page
- [ ] "Open Troubleshooting Tools" button is available (stopped-canister only) and navigates to `/account#troubleshooting`
- [ ] "Open Account Status" button navigates to `/account`
- [ ] "Return to Home" button navigates to `/`
- [ ] After backend restart, "Retry Connection" successfully recovers and loads data

### Access Control Warning (Non-Blocking)
- [ ] When backend is healthy but access-control init fails → shows warning banner (not blocking error)
- [ ] Warning banner displays: "Access control initialization failed: [reason]. Some admin features may be limited."
- [ ] Page content remains accessible below the warning
- [ ] Admin verification continues to work despite access-control warning

## Error Handling Validation
- [ ] All error messages are in English
- [ ] Error messages are actionable and user-friendly
- [ ] Retry actions trigger both actor initialization and query refetch
- [ ] No blank screens occur on error
- [ ] Error boundaries catch runtime exceptions in admin panels
- [ ] Toast notifications show for mutation errors

## Guest Account & Booking Flow Tests
### 1. Guest Account Access Test
- [ ] Navigate to `/guest-account` while logged out
- [ ] Verify login prompt appears
- [ ] Login with Internet Identity
- [ ] Guest Account page loads within 10 seconds
- [ ] No infinite loading or blank screen occurs

### 2. Guest Account CTA Test
- [ ] Navigate to Guest Account page
- [ ] Verify "Browse Hotels & Make a Booking" CTA is prominently displayed
- [ ] Click the CTA button
- [ ] Verify navigation to `/browse` route works correctly

### 3. Booking Creation Success Test
- [ ] Navigate to Browse Hotels page
- [ ] Click "Book" button on any hotel card
- [ ] Fill in valid check-in date (future date)
- [ ] Fill in valid check-out date (after check-in)
- [ ] Fill in number of guests (1-20)
- [ ] Submit booking request
- [ ] Verify success message shows with booking ID
- [ ] Verify payment instructions are displayed
- [ ] Close dialog and verify booking appears in Guest Account

### 4. Booking Validation Test
- [ ] Open booking dialog
- [ ] Try to submit with empty check-in date
- [ ] Verify inline validation error appears
- [ ] Try to submit with check-out before check-in
- [ ] Verify inline validation error appears
- [ ] Try to submit with 0 guests
- [ ] Verify inline validation error appears
- [ ] Verify no crash occurs during validation

### 5. Booking Actor Timeout Test
- [ ] Simulate network delay (throttle to Slow 3G)
- [ ] Open booking dialog and submit valid booking
- [ ] Wait for timeout (10 seconds)
- [ ] Verify timeout error message appears
- [ ] Verify "Retry Connection" button is available
- [ ] Click retry and verify booking can complete

### 6. Booking Cancellation Test
- [ ] Navigate to Guest Account
- [ ] Verify pending bookings are listed
- [ ] Click cancel button on a pending booking
- [ ] Confirm cancellation in dialog
- [ ] Verify booking status updates to "Cancelled"
- [ ] Verify toast notification shows success

### 7. Empty Bookings State Test
- [ ] Navigate to Guest Account with no bookings
- [ ] Verify empty state message appears
- [ ] Verify "Browse Hotels & Make a Booking" button is present
- [ ] Click button and verify navigation to Browse Hotels

### 8. Booking Error Handling Test
- [ ] Try to book an inactive/unpaid hotel (if available)
- [ ] Verify user-friendly error message appears
- [ ] Verify error does not crash the dialog
- [ ] Verify error message is in English
- [ ] Close and reopen dialog to verify state is reset

## Admin Panel Stability
### 1. Fresh Load Test
- [ ] Navigate to `/admin` from logged-out state
- [ ] Login as admin
- [ ] Admin Panel loads within 15 seconds
- [ ] All four panels render (Invites, Visibility, Payments, Bookings)
- [ ] No blank screens or infinite loading

### 2. Navigation Test
- [ ] Navigate away from Admin Panel to another route
- [ ] Navigate back to Admin Panel
- [ ] Panel loads without re-authentication
- [ ] Previously loaded data is visible immediately
- [ ] Background refetch completes without disrupting UI

### 3. Retry Test
- [ ] Simulate network delay (throttle to Slow 3G in DevTools)
- [ ] Navigate to Admin Panel
- [ ] Wait for timeout/error state
- [ ] Click Retry button
- [ ] Panel loads successfully after retry
- [ ] No page reload required

### 4. Stopped Canister Test
- [ ] Stop the backend canister (`dfx canister stop backend`)
- [ ] Navigate to Admin Panel
- [ ] Verify stopped-canister detection shows user-friendly message
- [ ] Verify raw technical details are expandable
- [ ] Start canister (`dfx canister start backend`)
- [ ] Click Retry
- [ ] Panel loads successfully

### 5. Access Denied Test
- [ ] Login as non-admin user
- [ ] Navigate to `/admin`
- [ ] Verify access denied message shows
- [ ] Verify "View Account Status" and "Return to Home" buttons work
- [ ] No blank screen or crash occurs

### 6. Sub-Panel Error Isolation Test
- [ ] Login as admin
- [ ] Navigate to Admin Panel
- [ ] If one panel fails (e.g., Hotel Visibility), verify:
  - [ ] Other panels still render normally
  - [ ] Failed panel shows inline error with retry
  - [ ] Page header and navigation remain intact
  - [ ] No full-page crash occurs

### 7. Verification Timeout Test
- [ ] Login as admin
- [ ] Navigate to Admin Panel
- [ ] If admin verification takes >15 seconds:
  - [ ] Watchdog timer triggers diagnostics card
  - [ ] Retry action is available
  - [ ] No infinite loading occurs

### 8. Background Refetch Stability Test
- [ ] Login as admin
- [ ] Navigate to Admin Panel
- [ ] Wait for initial load to complete
- [ ] Trigger background refetch (wait for staleTime or manual refetch)
- [ ] Verify:
  - [ ] Previously loaded data remains visible during refetch
  - [ ] No blank screen flicker occurs
  - [ ] Lightweight loading indicator shows (if any)
  - [ ] Refetch completes within 15 seconds or shows timeout

## Hotel Visibility Panel Specific Tests
- [ ] Panel uses single combined backend call (`adminGetAllHotelVisibilityStats`)
- [ ] No per-hotel fan-out calls occur
- [ ] Empty state shows when zero hotels exist
- [ ] Timeout/error shows inline with Retry action (no blank screen)
- [ ] Hotel Principal IDs are displayed correctly
- [ ] Visibility controls (Active/Inactive, TEST, Paid/Unpaid) work correctly
- [ ] Mutations invalidate the correct query keys
- [ ] Error isolation: panel errors don't crash other admin panels

## Data Integrity
- [ ] Hotel profiles save correctly
- [ ] Booking requests create successfully
- [ ] Stay records create successfully
- [ ] Payment requests create successfully
- [ ] Invite tokens generate and consume correctly
- [ ] Admin recovery works correctly

## Mobile Responsiveness
- [ ] All pages render correctly on mobile (375px width)
- [ ] Touch interactions work properly
- [ ] Horizontal scroll is prevented
- [ ] Tables are horizontally scrollable on mobile
- [ ] Forms are usable on mobile
- [ ] Booking dialog is usable on mobile

## PWA & Offline
- [ ] Service worker registers successfully
- [ ] App is installable on mobile
- [ ] Offline cache works for static assets
- [ ] Online/offline transitions are handled gracefully

## Performance
- [ ] Initial page load is under 3 seconds
- [ ] No unnecessary re-renders occur
- [ ] Images load efficiently
- [ ] No memory leaks in long-running sessions

---

**Completion Status:** [ ] All items checked and verified
**Tester:** _________________
**Date:** _________________
**Notes:** _________________
