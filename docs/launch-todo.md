# Recipe Vault Launch Todo

Scope: single-user MVP, shared recipes and favorites on desktop and iPhone. Hosting, access method, and grocery sync are still decisions. See [project-status.md](project-status.md) for findings and rationale.

## Completed Foundation

- [x] Database-backed recipe CRUD and favorites.
- [x] Starter seed data and legacy browser import bridges.
- [x] Runtime validation on create, update, and recipe import.
- [x] Malformed JSON handling for recipe and favorite write requests.
- [x] Numeric form conversion and form-to-API regression tests.
- [x] Prevent repeated imports of missing legacy favorites.
- [x] Recipe/favorite JSON export and health endpoint.
- [x] Environment checks, explicit type checks, unit tests, and production build command.
- [x] Desktop/mobile Chromium browser workflow tests with mocked APIs.
- [x] Manifest, Home Screen icons, and mobile form layout checks.
- [x] Manual smoke checklist and backup/restore notes.
- [x] Runtime dependency advisory remediation from the November review.

## Next: Reliability Without Hosting

- [x] Retire confirmed legacy recipe copies safely; deleted imported recipes stay deleted after refresh.
- [x] Preserve original browser copies in a downloadable recovery archive before retirement.
- [ ] Complete favorite migration state; old browser favorites must not restore removed database favorites.
- [ ] Handle malformed/unavailable localStorage without crashing or silently destroying recoverable data.
- [ ] Fix grocery item ownership after editing/removing a contributing recipe.
- [ ] Return consistent JSON errors from remaining database operations; test concurrent writes/deletes.
- [ ] Display actionable validation/conflict messages from API clients.
- [ ] Report skipped/rejected import records accurately and bound import/request sizes.
- [ ] Add CI for checks, production build, and browser workflows.
- [ ] Add isolated live-Postgres tests for migrations and recipe/favorite persistence.
- [ ] Extend browser coverage to delete/reload, favorite toggle, grocery flows, export, and unavailable-server states.
- [ ] Review form semantics, accessible names, long titles, and all mobile pages.
- [ ] Recheck development-tool advisories when upstream fixes become available.

## Data Transfer And Recovery

- [ ] Choose app-level JSON restore or a documented provider recovery procedure for v1; JSON restore is the preferred provider-independent path.
- [ ] Make backup export a consistent snapshot of recipes and favorites.
- [ ] Implement and test validated JSON restore with duplicate preview and explicit confirmation.
- [ ] Test a local export restored into a separate empty database, including favorites.
- [ ] Document transfer from localhost to the hosted origin; localStorage does not move between URLs.
- [ ] Define production backup retention and test the restore procedure.

## Decisions Before Deployment

- [ ] Choose the app host and PostgreSQL provider, including free-tier limits.
- [ ] Choose protection for both UI and API routes. An unlisted URL is not protection.
- [ ] Confirm whether per-device grocery lists are acceptable for v1.
- [ ] Confirm which local data to transfer and the restore requirement for launch.

## Deployment And Acceptance

- [ ] Configure production secrets outside source control.
- [ ] Apply committed migrations and verify status against the intended production database.
- [ ] Transfer/seed approved data and verify recipe/favorite counts.
- [ ] Verify unauthorized requests cannot read/export or modify protected data.
- [ ] Run production health and [manual smoke tests](manual-smoke-test.md).
- [ ] Confirm desktop changes appear on the phone using the same hosted URL.
- [ ] Test iPhone Safari and Add to Home Screen on a real device.
- [ ] Confirm backup and recovery work before relying on the app for real use.

## Deferred Unless Required

- Multiple accounts and separate ownership.
- Offline editing or offline synchronization.
- Measurement conversion and fraction parsing.
- Visual redesign and nonessential notifications.

Keep changes incremental: one behavior or workflow per commit, with relevant tests and docs. Launch is determined by these checks, not a fixed number of commits or sessions.
