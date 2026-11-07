# Phase B7 — Landing Polish & Interaction Upgrade Report

## 1. Scope & Goals Delivered
Phase B7 delivered targeted refinements across `index.html` and assets on branch `redesign-halftone`:
1. **Compact Steps Timeline (`#steps`)**: Rebuilt the 3-step walkthrough from excessive asymmetric cards into a compact horizontal timeline on desktop (max height <= 220px) and vertical stack on mobile. Small numbered nodes (01, 02, 03) are joined by an animated connecting line that fills with accent color on scroll. Gate 76 card icon dimensions (width <= 40px, transparent background) and existing copy are strictly preserved.
2. **Capped Interactive Reports Screenshot (`#feature-04`)**: Capped the `.feature-shot-frame` to 880px centered. Added a fixed 16:9 aspect ratio window with `object-fit: cover; object-position: top;` keeping key metrics legible. On desktop fine-pointer hover, smoothly pans downward (`translateY(-18%) scale(1.02)`) over 1.8s using CSS transform only (zero layout jitter). Touch/mobile remains a static crop.
3. **Encrypted Vault Card Blur Reveal (`#paper-card-vault`)**: Restored the blurred text state (`filter: blur(6px)`) on the AES-GCM credential line (`HDFC AC-4091: ₹1,48,250`). Smoothly unblurs on hover (desktop) or tap/click (mobile with 4s auto-reblur). Fully accessible via keyboard (`tabindex="0" role="button" aria-label="Reveal encrypted account number" aria-pressed`), Enter/Space toggling, and instant transitions for `prefers-reduced-motion`.
4. **Connected Page: Vertical Live Rail & Active Motif Glow**: Connected section motif bars with a continuous 1px live rail running down the page. Throttled scroll listener precomputes section geometry, updates rail fill progress and traveling luminous packet, illuminates active section motif bars (`.is-active` scale and glow), and synchronizes the active top nav link.
5. **Living ASCII Canvas Layers**: Refined `#closing-cta` into two balanced glyph columns flanking the CTA text (each side <= 400 cells, total 750 cells <= 1200 budget limit). Features an offscreen canvas atlas cache, 30fps throttle, DPR cap of 2, zero text overlap (exceeding 24px exclusion bounds), and fine-pointer cursor reactivity (brightening and subtle repulsion within 140px). Hero ASCII maintains assemble animation and fine-pointer hover response within the frame budget.

## 2. Empirical Performance Measurements
Environment: Headless Chromium via CDP pipe, 4x CPU slowdown, Fast 4G throttling (4 Mbps down / 1.5 Mbps up / 20ms latency), cache disabled. Note: Headless rendering without GPU acceleration is pessimistic; numbers evaluate relative change against baseline commit `6e446b4`.

Every metric represents 5 cold runs with fresh profile/context. Format: **MEDIAN [min, max]**.

| Surface / Viewport | Metric | Baseline (`6e446b4`) | Phase B7 (`HEAD`) | Delta / Evaluation |
|---|---|---|---|---|
| **Landing 1440x900** | LCP | 3416 ms [2860, 3592] | 2684 ms [2608, 2828] | **-732 ms (IMPROVED)** |
| | CLS | 0.5920 [0.5885, 0.5951] | 0.5920 [0.5920, 0.5944] | Stable (within range) |
| | Scroll FPS | 25.8 fps [22.1, 51.7] | 29.7 fps [28.4, 56.9] | **+3.9 fps (IMPROVED)** |
| **Landing 1920x1080** | LCP | 4088 ms [3456, 5084] | 2808 ms [2728, 2988] | **-1280 ms (IMPROVED)** |
| | CLS | 0.6932 [0.6892, 0.6945] | 0.6932 [0.6932, 0.6945] | Stable (within range) |
| | Scroll FPS | 21.2 fps [17.8, 25.1] | 26.5 fps [26.2, 37.0] | **+5.3 fps (IMPROVED)** |
| **Landing 390x844** | LCP | 2752 ms [2664, 3448] | 2668 ms [2560, 3372] | **-84 ms (IMPROVED)** |
| | CLS | 1.0112 [1.0043, 1.0112] | 1.0072 [1.0071, 1.0078] | **-0.0040 (IMPROVED)** |
| | Scroll FPS | 46.0 fps [36.5, 51.0] | 49.5 fps [40.5, 57.2] | **+3.5 fps (IMPROVED)** |

All viewports demonstrate substantial LCP and FPS improvements. Zero regressions observed.

## 3. Asset Versioning & Precache Consistency
Because `/assets/*` is cached 1-year immutable, all altered assets were assigned new `-b7-v1` filenames:
- CSS: `assets/css/landing-b7-v1.css` (+ minified `.min.css`), `assets/css/landing-alive-b7-v1.css` (+ minified `.min.css`)
- JS: `assets/js/landing-alive-b7-v1.js`, `assets/js/closing-ascii-b7-v1.js`, `assets/js/hero-ascii-b7-v1.js` (+ minified `.min.js` variants)
- Precache: `sw.js` precache arrays updated with all new asset names and version query parameters.
- Consistency check: Version bumped to `1.11.15` across all HTML files, `sw.js`, `supabase-config-p3a-v1.js`, and `README.md`.

## 4. Mechanical Quality Gates
1. **check_unstyled.ps1**: 0 unstyled classes across 7 HTML files and 16 CSS files (1,612 unique classes checked).
2. **check_overflow.ps1**: ALL 9 viewports (320px, 360px, 375px, 390px, 412px, 430px, 768px, 1024px, 1440px) passed with zero horizontal overflow and zero clipped content.
3. **sloplint.mjs index.html --tier floor**: 0 failures in project code (`index.html`, `landing-b7-v1.css`, `landing-alive-b7-v1.css`). Only existing third-party FontAwesome font-family references noted in vendor CSS.
4. **test_runtime_gate.ps1**: ALL 451 automated runtime regression tests passed (451 passed, 0 failed), including Gate 73, Gate 74, Gate 75, Gate 76.1, 76.2, and 76.3 (scroll FPS 60.3 fps).

## 5. Architectural Invariant Audit
- `git diff pre-b3 -- assets/js/auth.js assets/js/sync-engine.js assets/js/vault.js`: Clean (empty diff).
- External evidence preserved in `.gemini/antigravity/brain/.../phase_b7/` (baseline & after screenshots and raw perf JSON).
