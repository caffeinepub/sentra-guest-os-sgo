# Specification

## Summary
**Goal:** Provide clear in-app guidance for publishing/deploying the app and what to do when deployments fail or changes aren’t visible after a successful deploy.

**Planned changes:**
- Add a “Publishing & Deployment” help section to the Account Status page with step-by-step English guidance on publishing/deploying, retrying/rerunning deployment when it fails, and a checklist for when a successful deploy doesn’t show updates (hard refresh, reset app cache, disable offline cache/service worker).
- Add a link/button in the new help section that scrolls/navigates to the existing Troubleshooting tools on the same page (e.g., via the existing #troubleshooting anchor).
- Extend the existing Pre-Publish Gate UI with a “Post-deploy verification” subsection (English) containing 3–5 checkboxes to confirm the new version is live, plus a note to use Troubleshooting tools to clear caches and retry if verification fails due to stale assets.
- Add a link/button from the Pre-Publish Gate area to the Troubleshooting section (or the Account Status troubleshooting anchor).

**User-visible outcome:** Users can find publishing/deployment instructions on the Account Status page, quickly jump to Troubleshooting tools, and follow a post-deploy verification checklist to confirm their latest version is live (with clear steps to retry deployment or resolve caching issues).
