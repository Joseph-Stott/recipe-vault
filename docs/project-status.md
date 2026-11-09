# Recipe Vault Project Status

Reviewed November 9, 2026. Scope: single-user recipe collection shared between desktop and iPhone. This is a working local app, not a verified production deployment.

Use [launch-todo.md](launch-todo.md) for the ordered backlog, [manual-smoke-test.md](manual-smoke-test.md) for release checks, and [backup-restore-notes.md](backup-restore-notes.md) for recovery limitations.

## Current Capabilities

| Area | Current behavior | Remaining limitation |
| --- | --- | --- |
| Recipes | PostgreSQL-backed create, read, edit, delete; starter seed data | Live database/browser integration is not automated |
| Validation | Shared runtime validation for create, update, and import; malformed JSON returns 400 | Update/import database failures still need consistent JSON responses |
| Form | Typed amounts convert to numbers; invalid quantities and cookbook pages are rejected | Use decimal quantities; fractions such as `1/2` are not parsed |
| Favorites | Database-backed toggle plus legacy browser import | Concurrent toggles/imports and stale local copies need further work |
| Grocery list | Browser-local selection, aggregation, purchased-item tracking | No cross-device sync; ownership and corrupt-storage recovery need work |
| Search | Title, ingredients, time category; case/spacing normalization | All recipes load client-side, appropriate for current small scope |
| Backup | JSON export of recipes and favorite slugs | No general restore; grocery state is not included |
| iPhone | Manifest, icons, dark presentation, responsive layouts | No offline support; real Safari/Home Screen verification remains |

## Architecture And Data Boundaries

Pages/components collect input. Hooks load data and coordinate browser storage. `lib/recipeService.ts` handles grouping and form conversion; `lib/recipeValidation.ts` validates typed form drafts. `lib/recipeRequest.ts` validates untrusted API input. API routes use Prisma with PostgreSQL.

Recipes, ingredients, and favorites live in the database. Grocery items, grocery recipe slugs, and retained legacy recipe/favorite copies live in localStorage. The database record wins when both recipe copies exist, but the legacy copy is not retired after import.

localStorage belongs to an origin as well as a browser/device. A hosted URL cannot read recipes stored under localhost. Deployment needs an explicit export/restore or database transfer procedure, not just the existing homepage import button.

## Changes From This Review

- Fixed typed quantities being sent as strings and rejected by the creation API.
- Added form-to-API contract tests and browser tests for create/edit and invalid quantities.
- Stopped automatic favorite-import request loops when a legacy favorite references a missing recipe.
- Shared runtime validation across recipe write endpoints; legacy import converts old numeric strings without modifying the source record.
- Updated Next.js and compatible dependencies to address reported runtime advisories.
- Added explicit type checking to the standard verification command.

## Verification And Its Limits

- `npm run check`: schema validation, generated Next.js route types, TypeScript checking, ESLint, and unit/route tests.
- `npm run preflight`: environment checks, standard checks, and a production build.
- `npm run test:browser`: Playwright tests on desktop and mobile-sized Chromium. API responses are intercepted; no real database writes occur. This is browser workflow coverage, not end-to-end database verification or an iPhone Safari test.
- `npm run smoke:health`: a running server and reachable database are required. Build success alone does not establish this.
- `npm audit --omit=dev`: runtime dependency advisory check. The November review cleared runtime advisories; eight moderate reports remained in the development-only ESLint/minimatch dependency chain. Recheck before release rather than forcing npm's suggested lint-config downgrade.

There is no committed CI workflow yet. The build downloads Google fonts and needs network access. No production environment, real-device session, live migration, or restore drill was verified in this review. See the release checklist before declaring the app ready.

## Findings Still To Address

### Data Lifecycle

1. **Imported recipes can reappear after deletion.** The database recipe is removed but a retained local copy still appears in the merged collection. Retire confirmed migrated copies with a recovery path and test deletion/reload.
2. **Local favorites can override later database changes.** The transition merges both sources; it needs a defined completion state, not permanent fallback copies.
3. **Malformed browser storage can break rendering.** JSON errors are still thrown from external-store snapshots. Grocery caches also mark data as cached before parsing succeeds. Add recovery that preserves the raw data and offers a deliberate reset/export.
4. **Grocery ownership is inferred from current ingredients.** Editing a recipe after adding it can leave old ingredients behind when removing it. Track source recipe identity on grocery items before changing persistence.

### API And User Experience

- Update, delete, import, favorite, and export database failures need consistent JSON responses. Cover concurrent deletion and duplicate import races.
- API clients replace useful server errors with generic messages. Surface approved validation/conflict messages while retaining safe fallbacks.
- Import counts omit entries without slugs; report rejected/skipped entries so migration results are understandable.
- Backup export reads recipes and favorites separately; use a consistent snapshot so concurrent edits cannot produce mismatched data.
- Put bounds on recipe sizes/import batches before exposing write endpoints.
- Complete keyboard/screen-reader labels, long-title/mobile overflow checks, and error-state tests. Current browser checks cover the form, not every page.
- Grocery unit handling strips/adds `s`; it is not a measurement-conversion system. Avoid implying conversion between different units.

## Launch Decisions

| Decision | Needed for | Recommended direction |
| --- | --- | --- |
| Hosting/database provider | Public HTTPS URL and shared data | Free-first, with explicit sleep, storage, backup limits; provider selection is still open |
| Access protection | Prevent anyone on the internet reading/changing the collection | Protect both pages and API routes before public use; an obscure URL is not access control |
| Grocery sync | Same grocery list on phone and desktop | Confirm whether per-device state is acceptable for v1 before designing a database migration |
| Restore and initial data | Moving local data and recovering mistakes | Prove JSON restore or the chosen provider's recovery procedure on a disposable database |

Single-user scope avoids account administration and multi-tenant ownership, but it does not remove the need for access protection. Authentication method and hosting remain product decisions; neither was selected in this review.

## Recommended Development Order

1. Complete migration cleanup and browser-storage recovery, with regression tests for deletion/reload.
2. Standardize remaining API errors and concurrency handling, then expose useful messages in the UI.
3. Add CI and a disposable-Postgres integration suite covering create/edit/delete/import/export. Keep mock-based browser tests as the faster separate layer.
4. Implement a validated restore/transfer path and demonstrate recovery. Keep schema/import changes in their own reviewable commits.
5. Choose hosting and access protection, deploy, verify database migrations and HTTPS behavior, then test actual iPhone Safari and Home Screen use.

The first four tracks can proceed without a hosting decision. Keep each change focused on one behavior and its tests; do not use a target commit count or calendar estimate as a substitute for acceptance criteria.
