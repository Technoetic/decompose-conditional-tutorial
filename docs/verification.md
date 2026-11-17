# Verification record

Status: local source, tests and browser acceptance are complete. Public GitHub Pages deployment and an already-open A-to-B update both passed.

- `npm test`: 43 of 43 Node tests passed. The checks include all 365 valid dates and 12 cup quantities, boundary fixtures, invalid inputs, storage and update behavior.
- `npm run build`: completed with build ID `dc-61e15ae4ceb7`.
- Aside DOM layout checks covered all six screens at viewport widths 1440, 390 and 340 pixels: 18 layouts, with no document-level horizontal overflow. Screenshot capture timed out through CDP, so pixel appearance was not verified by screenshots.
- An independent read-only reviewer ran 25 scoped checks successfully. Review findings were addressed, including reconciliation of obsolete saved question selections while retaining valid notes and other progress.
- The official [Decompose Conditional](https://refactoring.com/catalog/decomposeConditional.html) and [Extract Function](https://refactoring.com/catalog/extractFunction.html) catalog pages returned HTTP 200.
- The four GitHub Actions SHA pins in `.github/workflows/pages.yml` were checked against the GitHub API for the stated versions.
- Jev returned `needs_review` with low decisiveness on the boundary and per-order fee. Deterministic fixtures and exhaustive date/quantity checks resolve those arithmetic and boundary questions; the Jev result is not treated as a pass.

## Public deployment and update

Aside browser acceptance completed 38 distinct checks: all three function roles, four date boundaries and intentional bug, six quiz answers and note persistence, data-only refresh without replacing the document, hash history/deep links/404, clean and dirty A/B updates and rollback, delayed-save typing protection, dirty state recheck after version fetch, invalid/unavailable version response, content failure/retry, question revision reconciliation, stale-entry recovery, reduced motion, storage failure/recovery, late-response rejection and clipboard fallback. Updates were tested with actual served A/B builds; failure injection stayed in an ignored local test harness.

Aside coordinate clicks required explicit scrolling; DOM click dispatch was used for modal/update checks. Hash history used browser history APIs because the CLI navigation helper waits for a full document load. Native mobile devices and native BFCache restoration were not tested. Screenshot capture failed; DOM layout and interaction checks do not establish pixel-perfect appearance.

First Pages run `44002677060` succeeded for source `53d68a34e2d595e6f47ce962b41388880607bf53`. Public build `dc-0623a6061e70` passed SHA-256 checks for all 22 manifest files, all six screens at 1440/390px (12 layouts, no document overflow), matching embedded/version/manifest identities and an actual missing-asset 404. GitHub Pages returned `Cache-Control: max-age=600`; fresh version requests use a unique query. The local Windows working files and Git-normalized Linux source have different byte-derived build IDs; behavior is tested on both.

Second Pages run `44003153942` succeeded for source `bb7935437273fb6fa51d1ab53f2559e7647d396a`, build `dc-e8a14ae86383`. Its footer explicitly reminds learners that calculation results stay unchanged. An actual public A tab stayed open while B was deployed: focus preserved the unsaved note and old document, ?keep writing? preserved it, then save-and-navigate loaded the complete B document at `#/code` with the note intact and a cache-busting URL. This was observed in the public browser, separately from the local failure-injection tests.

The B public manifest retained all 19 immutable A assets alongside the 19 new assets and three current files. This record is a documentation-only follow-up; the application build ID remains unchanged.

## Handoff

- **task_id:** `decompose-conditional-tutorial-verification`
- **artifact_paths:** `docs/verification.md`; build output and tests are described above.
- **verification_commands_and_results:** `npm test` 43/43; `npm run build` produced `dc-61e15ae4ceb7`; 18 Aside DOM layouts had no document overflow; independent read-only review passed 25 scoped checks; catalog responses and Actions pins were checked as stated above.
- **assumptions:** These results apply to the stated source/builds. Real mobile devices, native BFCache and pixel appearance are outside the completed checks.
- **unresolved:** Aside CDP screenshot capture timed out. Pixel screenshot review, native mobile hardware and native BFCache restoration were not completed.
- **next_safe_action:** Open the published tutorial and begin at the first screen. Future code releases should rerun the relevant acceptance checks.
- **verified_by:** Independent read-only agent `dc_final_review` ran 25 affected checks and confirmed both review fixes; the controller ran browser/public checks and GitHub CI ran all 43 Node tests on both deployment commits.
