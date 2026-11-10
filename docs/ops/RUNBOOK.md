# Ledgio — Operations & Release Runbook

A concise operational reference for building, testing, deploying, rolling back, and operating Ledgio in production.

---

## 1. How to Release

All releases follow a strict, automated verification cycle before code is pushed to `main`.

1. **Verify working tree status:**
   ```powershell
   git status
   ```
2. **Execute the release build & version bump:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/build.ps1 -Version <NEW_VERSION>
   ```
   *This compiles all `.min.js` and `.min.css` bundles, updates `sw.js` cache tokens, stamps version numbers across HTML files, and validates asset paths.*
3. **Execute all verification gates:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/check_version_consistency.ps1
   powershell -ExecutionPolicy Bypass -File scripts/check_build_current.ps1
   powershell -ExecutionPolicy Bypass -File scripts/check_migrations.ps1
   powershell -ExecutionPolicy Bypass -File scripts/verify_innerhtml_audit.ps1
   powershell -ExecutionPolicy Bypass -File scripts/test_runtime_gate.ps1
   ```
   *All 5 gates must pass (exit code 0).*
4. **Commit and deploy:**
   ```powershell
   git add -u
   git commit -m "chore(release): bump version to v<NEW_VERSION>"
   git push origin main
   ```
   *Cloudflare Pages automatically detects changes pushed to `main` and deploys to `ledgio.pages.dev` within ~60 seconds.*

---

## 2. How to Roll Back a Deployment

If a bad deployment reaches production, rollback via the Cloudflare Pages control plane:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** &rarr; **Pages** &rarr; **ledgio**.
3. Select the **Deployments** tab.
4. Locate the last known good deployment.
5. Click the three dots menu (**···**) on that deployment &rarr; **Rollback to this deployment**.
6. Cloudflare instantaneously points edge traffic to the previous deployment build artifacts.
7. Service workers on clients will detect the change on next visit, invalidate the cache, and re-fetch the previous app shell.

---

## 3. How to Apply a Database Migration

Database migrations live in `supabase/migrations/` as the single canonical source of truth.

1. **Open Supabase SQL Editor:** Navigate to your [Supabase Project Dashboard](https://supabase.com/dashboard) &rarr; **SQL Editor**.
2. **Execute Migration:**
   - Copy the exact contents of the new SQL file from `supabase/migrations/<phase_file>.sql`.
   - Paste into the SQL Editor and click **Run**.
   - Confirm query output reports `Success. No rows returned` or table modification success.
3. **Assert Security & RLS Policies:**
   - Open and execute `backend/verify_schema_phase9.sql` in the SQL Editor.
   - Verify all assertions return `PASS` (ensures RLS remains active on all 11 tables and `WITH CHECK` constraints are intact).

---

## 4. How to Recover a User with Stale or Corrupted Local Data

Ledgio is local-first (`localStorage`). If a client device gets out of sync, corrupted by an aborted storage write, or encounters a sync lock:

### Method A: UI Self-Heal & Cloud Re-Pull (Non-Destructive)
1. In the app header, tap the sync status pill (or open the left sidebar &rarr; **Sync Diagnostics**).
2. Click **Sync Now** (`#trigger-sync-now-btn`).
3. This triggers a full reconciliation: pending mutations in the FIFO queue replay to Supabase, followed by a delta pull of the latest cloud rows into local state.

### Method B: Hard Service Worker & Cache Reset
1. Instruct the user to trigger a hard refresh:
   - **Desktop:** `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (macOS).
   - **Mobile PWA:** Close the app, open the browser, clear site storage for `ledgio.pages.dev`, and relaunch.
2. If the user is authenticated, signing out and back in safely purges device cache while preserving cloud data:
   - Go to **Settings** &rarr; **Log Out** (any pending offline edits are prompted before discarding).
   - Sign back in: Ledgio pulls all expenses, categories, goals, income, and loans freshly from Supabase.
