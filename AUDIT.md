# Homebase repair and audit — 2026-10-04

The original checkout built and its development server started. A clean browser profile loaded the welcome screen, so the reported failure was not reproduced in that profile. The audit found startup failure paths in browser storage and unvalidated saved settings, plus no conventional npm start script.

## Fixes

- Added npm start, Node runtime requirements, and launch instructions.
- Guarded storage reads; normalized malformed and legacy settings without mutating defaults.
- Preserved corrupt saved data and provided recovery export; quota failures now display a persistent unsaved-data warning.
- Debounced saves, flushed on page hide, and prevented silent overwrites when another tab changes saved data.
- Added a render error boundary with saved-data export.
- Validated backup size, JSON, relationships, unique IDs, task shapes, and timestamps. Imports use an accessible confirmation dialog.
- Restricted saved links to absolute HTTP(S) without credentials, including links in Markdown. Remote Markdown images no longer make external requests. Removed Google Fonts network requests.
- Updated vulnerable build dependencies, migrated Tailwind to v4 while retaining the theme configuration, and patched esbuild through an override. Production HTML includes a content security policy.
- Fixed command items incorrectly receiving disabled pointer styling for data-disabled=false. Removed nested command roots, added dialog labels, stable item values, search keywords, and reference/snippet creation commands.
- Command creation no longer changes the saved default card type; shortcuts respect active dialogs.
- Fixed whitespace searches and space navigation retaining stale filters; matching spaces are now selectable.
- Added card drag handles so editing, task controls, text selection, and mobile scrolling do not trigger dragging. Reordering uses visible order and preserves hidden cards and pinned groups.
- Added accessible names, visible card/space actions on touch devices, task-item removal, URL errors, and duplicate-tag normalization.
- Restored snippet syntax highlighting with safe code fences and language handling.
- Replaced the mobile navigation overlay with a focus-trapped Radix sheet. Improved viewport sizing, text contrast, Markdown code colors, overflow handling, and reduced-motion support.
- Made the timer available on mobile; it follows wall time through background throttling and space navigation, and retains state in the tab session.
- Restored custom daily greetings, exposed manual sorting, removed silent task/link truncation, and adjusted columns when optional daily sections are hidden.
- Split Markdown and optional panels out of the startup bundle, indexed space lookup, deferred search, and limited card rendering to batches of 60.

## Validation

- 15 regression tests: blocked/full storage, recovery, malformed/legacy settings, backups, unsafe URLs, timer arithmetic, reordering, and tab conflicts.
- TypeScript and production build pass.
- npm audit: zero known vulnerabilities after dependency updates.
- Browser checks: startup, onboarding, spaces, Markdown, safe/unsafe link creation, task addition/removal/toggling, command selection by mouse/keyboard, search, settings, timer continuity, keyboard reordering, and reload persistence.
- Desktop and 390 × 844 mobile layouts inspected in light and dark themes.

## Limits

The audit covers this checkout and the tested browser flows; it is not a guarantee that no undiscovered defects exist. Browser storage can still be disabled, cleared, or exhausted; the app reports this and supports export. It remains a static local-first app without an offline service worker. The in-app browser's download event did not complete, so an actual backup download was not verified there; parsing and restore logic were regression-tested.
