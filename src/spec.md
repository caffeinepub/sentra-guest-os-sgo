# Specification

## Summary
**Goal:** Make the app resilient when the backend canister is stopped by adding an explicit backend health check and ensuring the frontend consistently surfaces a clear diagnostics state instead of partial renders or infinite loading.

**Planned changes:**
- Add a public, anonymous-safe backend query endpoint (e.g., `health()`) in `backend/main.mo` that returns a stable response including `ok` and a `timestamp` from `Time.now()`.
- Update `useActorSafe` to verify backend liveness by calling the new health endpoint after actor creation, and treat any failure (timeout/rejection/replica error) as a terminal, user-visible connection error via the existing diagnostics UI (no infinite loading).
- Migrate any remaining route/page-level usage of the legacy blocking actor hook (`frontend/src/hooks/useActor.ts`) to `useActorSafe` + `RequireActorReady` so a stopped backend cannot cause blank panels or cascading failures.
- Improve the stopped-canister diagnostics English copy to (a) show detected canister ID when present, (b) clearly state the backend is stopped, and (c) provide actionable next steps (retry, hard refresh, open troubleshooting), while keeping raw technical details behind an expand/collapse control.
- Update `frontend/REGRESSION_CHECKLIST.md` with a dedicated “Backend stopped (IC0508)” checklist covering route access, retry behavior, troubleshooting navigation, and confirming access-control initialization warnings do not block normal flows when backend is healthy.

**User-visible outcome:** When the backend canister is stopped, all relevant routes consistently show a clear diagnostics error card (with optional expandable technical details and a copyable canister ID when available) and the app never gets stuck in infinite loading; when the backend is healthy, access-control initialization failures only warn and do not block general usage.
