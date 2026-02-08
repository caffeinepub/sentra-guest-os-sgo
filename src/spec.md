# Specification

## Summary
**Goal:** Restrict Account Status technical/admin guidance to admins only, and publish Draft Version 53 live after the UI updates.

**Planned changes:**
- Hide the Account Status “Troubleshooting” section (including its header/content and any surrounding separators) for non-admin authenticated users; keep it unchanged and functional for admins.
- Hide the Account Status “Publishing & Deployment” help card (and any surrounding separators) for non-admin authenticated users; keep it unchanged and functional for admins.
- Adjust the Account Status header/subtitle copy so non-admin users are not told about troubleshooting or deployment tools, keeping all user-facing text in English.
- Perform the platform publishing step to publish Draft Version 53 to live/production after applying the above UI changes.

**User-visible outcome:** Non-admin users see a simplified Account Status page without Troubleshooting or Publishing/Deployment guidance, while admins continue to see and use those tools; the updated Draft v53 is published to a live/production link.
