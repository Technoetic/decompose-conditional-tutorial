# IF / CLEAR design

## Outcome

A complete Korean, mobile-friendly interactive tutorial for Martin Fowler's Decompose Conditional, published to https://technoetic.github.io/decompose-conditional-tutorial/. Continue the user's cafe refactoring tutorial series. The user explicitly authorized creation and GitHub Pages publication; no further deployment confirmation is required. No Sites hosting.

## Teaching model

One fictional cafe's 2026 takeaway promotion: inclusive June 1 through August 31, 4,000 KRW per cup with packaging included. Otherwise 4,500 KRW per cup plus one 500 KRW packaging charge per order. Cup count is integer 1–12. Original and extracted implementations must agree for all 365 valid dates and all 12 quantities. Dates are calendar dates, not time instants. Reject invalid dates, years outside 2026 and invalid quantities explicitly.

The refactoring extracts three intentions: condition isSummer, true branch summerCharge, false branch regularCharge. It changes names/structure, not truth, pricing, side effects or evaluation order. Do not imply all if statements need extraction or that extraction guarantees speed. A lab-only, clearly labeled exclude-start bug changes >= to > and is intentionally not equivalent. A correct baseline remains available.

Official catalog verified via Aside on 2026-11-17: https://refactoring.com/catalog/decomposeConditional.html. Additional technique: https://refactoring.com/catalog/extractFunction.html. Explain with original synthetic examples rather than copying the book.

## Experience and routes

1. / — Intro: an arresting typographic hero, a paper receipt/three-part branch diagram, a clear start action.
2. /read — See the complex condition and both branch calculations. Click each role to highlight and explain it; change date/cups and see the price.
3. /split — Button/touch/keyboard-friendly assignment studio: map isSummer, summerCharge, regularCharge into condition/summer/regular slots. Show why each role belongs there. No drag-only interaction or executable user code.
4. /lab — Inclusive boundary presets May31/Jun1/Aug31/Sep1, valid date/cups form, before/after prices, shared branch names, explicitly labeled exclude-start bug toggle and reset. Show differences, never claim the bug is refactoring.
5. /practice — Six single-answer questions with explanations and persistent selections; a 2000-character learning note with explicit saving and dirty protection.
6. /code — Readable complete before/after JavaScript, copy buttons if available with graceful fallback, three intentions, guardrails and official links.

All screen routes use hashes under one real project subpath. Unknown hash is a friendly in-app missing screen. Unknown asset/data/path returns real404. No login, remote database, analytics, chat or external runtime resources.

## Visual direction

IF / CLEAR. Editorial cafe-workshop aesthetic: warm paper, deep espresso/navy ink, mint/teal condition, coral summer branch and amber regular branch. Large clear Korean typography, finely aligned grids, strong negative space, subtle paper/receipt texture via CSS. Create diagrams directly in HTML/CSS/SVG because their state changes interactively. No generated decorative stock images, fake screenshots, people, logos, fake metrics or testimonials. Responsive at1440/390/340, accessible focus, semantic buttons/forms, reduced motion, good contrast. Product copy teaches the technique without exposing cache plumbing or build implementation details.

## Architecture and interfaces

Node22+, no external dependencies. ES module entry src/main.js; screen classes; domain/conditional.js is DOM-free; shared dom/routes; services for content/storage/router/entry/version; CSS tokens/base/components. Node built-in test runner. Hash-qualified module/CSS/icon assets, deterministic source-derived build dc-<hash>, version.json and pages-manifest.json. Existing owned value-reference tutorial infrastructure may be copied with attribution and adapted. Do not carry unrelated customer-ledger code, data or wording.

Domain exports:

- PLAN={start:'2026-06-01',end:'2026-08-31',summerRate:4000,regularRate:4500,serviceCharge:500}; DEFAULT_INPUT={date:'2026-07-15',cups:2}.
- validateInput(raw) -> fresh {date,cups}; accepts cups numeric integer or strict decimal-integer string; errors are user-facing Korean RangeError messages.
- isSummer(date,plan=PLAN), summerCharge(cups,plan=PLAN), regularCharge(cups,plan=PLAN).
- priceBefore(input,plan=PLAN) -> number; priceAfter(input,plan=PLAN,{excludeStart=false}={}) -> number.
- evaluate(input,{excludeStart=false}={}) -> {input,before,after,equal,branch,afterBranch}, branch values summer/regular.
- checkAssignments(slots) -> {correct,matched,perSlot:{condition,summer,regular}}; correct strings isSummer/summerCharge/regularCharge respectively. Missing/wrong strings fail; no eval.
- SNIPPETS={before,after}, displayed teaching code consistent with executable functions.

Content schema1: lessons exactly IDs intro/read/split/lab/practice/code, each {id,title,intro,takeaway,kicker}; questions exactly6 with unique safe IDs and unique options, one valid answer and explanatory text; sources only the two official catalog URLs. Content loads fresh from absolute same-origin base-relative URL, with loading/error/retry/abort/sequence protection.

Progress schema1: {schema:1,answers:{},note:'',input:DEFAULT_INPUT,excludeStart:false,slots:{condition:'',summer:'',regular:''}}. Storage key if-clear.progress.v1. Validate bounded known answer IDs/options, note<=2000, input, boolean and slots. Return clones. Save asynchronously and await storage.setItem (native localStorage is synchronous but async adapters can be tested). Storage failure preserves edits; no false success. No sensitive content is requested.

Screen interface: constructor(app,lesson), mount(root), dispose(), dirty boolean, async saveDraft(), discard(). app provides content, progress, saving, unsaved, persist(), notice(text), editState(). Screens import domain/shared only, not services or entry. Main owns routing/lifetime/async sequence, storage and update guards. BaseScreen owns event abort/head/foot. Six named classes IntroScreen, ReadScreen, SplitScreen, LabScreen, PracticeScreen, CodeScreen, each exported from its corresponding filename.

## Update contract

Use embedded HTML build identity, not latest version as running identity. Compare unequal IDs, including rollback. Check navigation/focus/visibility/pageshow. On the next clean navigation automatically full-document load intended route with _dc nonce; never background-force-reload. Protect both dirty/saving state, rechecking immediately before transition and after awaited checks. Guard offers stay/save/discard; new edits during save remain dirty. Failed saves stay dirty. Unknown/bad/offline version keeps old app usable. Startup cache loop guard prevents repeated replacement if CDN still serves old HTML. Keep verified published old hashed assets for stale entry HTML. Data-only changes load fresh without document replacement. GitHub Pages Cache-Control max-age600 is a platform limit; query revalidation/asset hashing mitigate it, not a custom-header guarantee.

## Ownership

TaskA domain/data/tests only. TaskB screens/styles/mark only. TaskC services/shared/build/server/manifest/retention/workflow and infrastructure tests only. Controller main/index/docs/integration/browser/deploy/vault records. No concurrent edits to another owner's files. Controller commits integration. New repository starts on feature branch; main publication happens only after checks and independent review. No existing source repositories or portfolio changes.

## Verification and publication

Domain expected outputs: July15 cups2 =>8000; May31 cups2=>9500; Jun1/Aug31 inclusive=>8000; Sep1=>9500. Exclude-start mutant Jun1=>9500 while baseline8000. Test all valid dates/cups plus invalid input, slot assignments and snippet agreement. Test async services including malformed payloads, blocked storage, race, timeout, read-state-after-check and entry loop behavior. Browser test all routes/deep links/history/404, studio, lab boundaries/bug, quiz/notes/save failures, widths/reduced motion, A/B dirty and clean full-document transitions, rollback, startup race, return events and fresh data. Local QA faults must remain outside public artifacts.

Publish via SHA-pinned GitHub Actions. Verify public manifest files with hashes, public routes at desktop/mobile, source commit and successful Pages workflow. Exercise a real public A-to-B transition if it fits the Aside session time limit; otherwise retain the live tab through an owned browser tab mechanism or report the exact untested limit. No fabricated publication test. Six-field handoff and independent reviewer required.
