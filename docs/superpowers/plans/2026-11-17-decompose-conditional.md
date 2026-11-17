# Decompose Conditional Implementation Plan

> For agentic workers: use superpowers:subagent-driven-development and follow assigned ownership.

**Goal:** Build IF / CLEAR, a Korean cafe-based interactive Decompose Conditional tutorial, and publish it to the user's GitHub Pages.

**Architecture:** Reuse the owned six-rule static tutorial infrastructure; implement fresh domain/content/screens. Source remains modular and dependency-free, build assets are content-addressed, and persisted edits survive safe update transitions.

**Tech Stack:** Node22+, native ES modules/classes, HTML/CSS/SVG, node:test, Aside, GitHub Actions/Pages.

**Spec:** docs/design.md

## Global constraints

- No Sites/chatgpt.site; GitHub Pages is explicitly authorized.
- Synthetic2026 cafe plan only, inclusive Jun1–Aug31, cups1–12, rates4000/4500 and regular per-order charge500.
- Six routes and six questions; no runtime packages, user-code evaluation or company information.
- Follow exact exported interfaces and file ownership in design.md. Controller commits and publishes.

## Review focus

- Invalid date normalized by JavaScript Date must be rejected, never silently moved into another day.
- New edits during a pending save/version request must remain protected and not be lost.
- Persisted malformed/prototype/unknown question state must not execute or pollute DOM/state.
- Same-build content update must refresh data without changing the document; stale requests cannot overwrite newer screens.
- App root path/hashed asset graph must work under the GitHub project subpath; missing files must remain404.

### Task1: Domain and lesson content

Files: src/domain/conditional.js, data/lessons.json, tests/domain.test.mjs, tests/content.test.mjs.

- [ ] Write failing tests for the price fixtures, inclusive boundaries, invalid inputs and extraction roles.
- [ ] Run node --test tests/domain.test.mjs and record the expected failure before implementing.
- [ ] Implement the exact spec exports, teaching snippets and six lessons/questions.
- [ ] Verify all365 dates x12 quantities for equivalence and the intentionally non-equivalent boundary mutant.
- [ ] Verify question uniqueness/source URLs and displayed snippets; send controller the result without committing shared work.

### Task2: Interactive screens and visual system

Files: src/screens/*.js, src/styles/{tokens,base,components}.css, assets/dc-mark.svg, tests/screen-contract.test.mjs if useful.

- [ ] Implement the six screen classes and BaseScreen against the app/domain interfaces.
- [ ] Build keyboard/touch assignment controls and live conditional highlights, preserving named roles.
- [ ] Implement lab form validation/boundaries/mutant; quiz selections and note saving with edit-during-save preservation.
- [ ] Build responsive cafe-workshop hero, explanatory diagrams and focused motion with reduced-motion support.
- [ ] Self-check accessible labels/escaping/lifetime and report concrete control selectors to controller.

### Task3: Navigation, storage, async and build infrastructure

Files: src/services/*.js, src/shared/*.js, scripts/*.mjs, .github/workflows/pages.yml, tests infrastructure files.

- [ ] Copy only reusable owned infrastructure from the prior value-reference tutorial; remove its domain coupling.
- [ ] Before changed behavior, write/run failing tests for new routes/schema/storage/asset names.
- [ ] Adapt six-route identity/history namespace, strict fresh content and progress schema, bounded note, async save semantics.
- [ ] Adapt dc build hashing, icon path, retention public URL and Pages workflow; genuine404 server with loopback-only bind.
- [ ] Run infrastructure tests for timeout/abort/malformed/error, dirty/saving/rollback/entry race,404 and cache contracts.

### Task4: Integration, independent verification and publication

Files: src/main.js, index.html, README.md, docs/verification.md; local QA scripts outside tracked output.

- [ ] Integrate app, route screen factory, safe save/protect behavior, semantic shell and one entry.
- [ ] Run npm test and npm run build; fix failures and obtain independent code/domain review.
- [ ] Execute real browser acceptance locally at1440/390/340, including routes/forms/history/404 and update edge cases.
- [ ] Create the public GitHub repository, enable Pages workflow, publish verified A, then verify public file manifest and routes.
- [ ] Publish final B and verify real already-open A clean/dirty transition plus target/build/note preservation where supported.
- [ ] Record exact commands/results/limits, independently verify published source, and update existing vault index/log with a new project note.
