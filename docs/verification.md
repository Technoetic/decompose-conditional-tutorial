# Verification record

Status: local source, tests and browser acceptance are complete. Public deployment checks are pending.

- `npm test`: 43 of 43 Node tests passed. The checks include all 365 valid dates and 12 cup quantities, boundary fixtures, invalid inputs, storage and update behavior.
- `npm run build`: completed with build ID `dc-61e15ae4ceb7`.
- Aside DOM layout checks covered all six screens at viewport widths 1440, 390 and 340 pixels: 18 layouts, with no document-level horizontal overflow. Screenshot capture timed out through CDP, so pixel appearance was not verified by screenshots.
- An independent read-only reviewer ran 25 scoped checks successfully. Review findings were addressed, including reconciliation of obsolete saved question selections while retaining valid notes and other progress.
- The official [Decompose Conditional](https://refactoring.com/catalog/decomposeConditional.html) and [Extract Function](https://refactoring.com/catalog/extractFunction.html) catalog pages returned HTTP 200.
- The four GitHub Actions SHA pins in `.github/workflows/pages.yml` were checked against the GitHub API for the stated versions.
- Jev returned `needs_review` with low decisiveness on the boundary and per-order fee. Deterministic fixtures and exhaustive date/quantity checks resolve those arithmetic and boundary questions; the Jev result is not treated as a pass.

## Pending

Aside browser acceptance completed 38 distinct checks: all three function roles, four date boundaries and intentional bug, six quiz answers and note persistence, data-only refresh without replacing the document, hash history/deep links/404, clean and dirty A/B updates and rollback, delayed-save typing protection, dirty state recheck after version fetch, invalid/unavailable version response, content failure/retry, question revision reconciliation, stale-entry recovery, reduced motion, storage failure/recovery, late-response rejection and clipboard fallback. Updates were tested with actual served A/B builds; failure injection stayed in an ignored local test harness.

Aside coordinate clicks required explicit scrolling; DOM click dispatch was used for modal/update checks. Hash history used browser history APIs because the CLI navigation helper waits for a full document load. Native mobile devices and native BFCache restoration were not tested. Screenshot capture failed; DOM layout and interaction checks do not establish pixel-perfect appearance.

The GitHub Pages publication, workflow result, public manifest and asset hashes, public routes, and a real public A-to-B update transition remain unverified. The controller will record the actual outcomes and any limits after those checks.

## Handoff

- **task_id:** `decompose-conditional-tutorial-verification`
- **artifact_paths:** `docs/verification.md`; build output and tests are described above.
- **verification_commands_and_results:** `npm test` 43/43; `npm run build` produced `dc-61e15ae4ceb7`; 18 Aside DOM layouts had no document overflow; independent read-only review passed 25 scoped checks; catalog responses and Actions pins were checked as stated above.
- **assumptions:** The reported results apply to the local build and evidence available when this record was prepared. Later source changes require the relevant checks to be repeated.
- **unresolved:** Screenshot capture, interactive browser acceptance, and public deployment verification remain pending.
- **next_safe_action:** Complete local browser acceptance, then publish and verify the authorized GitHub Pages destination and update this record with observed results.
