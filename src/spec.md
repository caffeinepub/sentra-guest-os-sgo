# Specification

## Summary
**Goal:** Add reviews/ratings for guests and hotels, align Hotel Account bookings UI with the Admin bookings model, and add cancel/delete booking actions with clearer publishing and URL troubleshooting guidance.

**Planned changes:**
- Add persistent Reviews/Ratings (1–5 stars + optional text) so both Guest and Hotel accounts can create reviews and view review lists (by hotel and by the caller), with authenticated/authorized backend enforcement.
- Update the Hotel Account bookings list UI to match the Admin bookings panel model (scrollable list, consistent booking card layout, and key booking metadata) without breaking confirm/reject flows.
- Add booking actions by role: Guest Account gets Cancel; Hotel Account gets Cancel and Delete; include confirmation prompts and success/error toasts; enforce backend ownership/authorization and refresh booking lists after actions.
- Add English UI messaging to prevent publishing guidance being treated as “ready” until Reviews/Ratings and booking UI/actions changes are verified.
- Improve English publishing/deployment help guidance for invalid published URL cases (e.g., “Canister ID Not Resolved”) with troubleshooting steps to obtain the correct live URL from existing deployment outputs.

**User-visible outcome:** Guests and hotels can submit and view reviews with star ratings, hotel bookings display in the same style as admin bookings, guests can cancel bookings, hotels can cancel or delete their bookings, and the app provides clearer English guidance about when it’s ready to publish and how to fix “Canister ID Not Resolved” URL issues.
