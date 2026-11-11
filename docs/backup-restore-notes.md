# Backup And Restore Notes

Recipe Vault currently supports backup export, but not full restore.

This document defines the operating expectation until a restore flow exists.

## Current Backup Capability

The app can export database recipes and favorite recipe slugs as JSON from:

```text
/api/recipes/export
```

The homepage links this as **Export Backup**.

The export includes:

- App identifier.
- Export timestamp.
- Recipe count.
- Favorite recipe slugs.
- Recipes with structured ingredients, cook instructions, cookbook, and page number data.

It does not include grocery lists, purchased-item state, or legacy recipes/favorites that have not reached the database. Recipes and favorites are currently read separately, so an export made during concurrent edits is not guaranteed to be a consistent snapshot.

## Current Restore Capability

There is no general restore UI yet.

Existing import paths are narrower:

- Older browser-saved recipes can be imported into the database from the homepage.
- Older browser-saved favorites can be copied into the database.
- Starter recipes can be seeded with `npm run db:seed`.

These are migration helpers, not a full backup restore system.

localStorage is tied to the browser and origin. The homepage import on a hosted URL cannot see older records saved under localhost. Keep the original data until a transfer has been verified.

## Legacy Migration Recovery

Confirmed recipe copies are removed from the active browser store only after their original contents have been saved under `recipe-vault:legacy-recovery:v1`. A matching database slug remains authoritative; recovery preserves different local versions without automatically restoring them. Failed or unconfirmed imports stay in the active local store.

The homepage's **Download Legacy Recovery** button saves the archive as JSON. Download it before clearing browser/site data and keep it outside the project folder. It contains a version, original recipe copies, and archived favorite slugs. It does not contain the current database collection or groceries and is not a substitute for **Export Backup**.

The archive is browser-local, not synchronized or protected against clearing site data. There is no automatic restore UI. To recover a specific older version, inspect the downloaded file and re-enter the needed fields through the recipe form, or use a separately reviewed import procedure. Do not replace the active browser stores with the whole archive: it can contain intentionally deleted recipes and old versions.

If the recovery archive is unreadable or cannot be saved, cleanup stops and retains active copies. Download the existing archive if available, preserve the active data, and resolve the storage issue before retrying. Corrupt active localStorage still needs a general recovery flow; do not clear it as a routine troubleshooting step.

## Recommended Manual Backup Routine

Before any risky production change:

- [ ] Run the production health smoke test.
- [ ] Export a backup from the deployed app.
- [ ] Confirm the downloaded JSON opens and contains recipes.
- [ ] Store the backup somewhere outside the project folder.
- [ ] Verify a tested database-level backup and restore procedure is available until app-level restore exists. Opening JSON alone does not prove recoverability.
- [ ] Run production migrations only after the backup is saved.

After production launch:

- [ ] Export a backup after meaningful recipe-entry sessions.
- [ ] Export a backup before schema or migration work.
- [ ] Keep at least one known-good backup from before each larger change.

## Restore Direction

A future restore flow should:

- Accept a Recipe Vault JSON backup.
- Validate the backup shape before writing data.
- Preview recipe and favorite counts.
- Skip duplicate recipe slugs by default.
- Report imported and skipped recipes.
- Restore favorites only for recipes that exist after import.
- Require explicit confirmation after preview and preserve the original file.
- Reject invalid or oversized inputs before writing; report failures without claiming a complete restore.

## Recovery Acceptance

- [ ] Export a known collection with recipes, ingredient amounts, optional fields, and favorites.
- [ ] Restore into a separate disposable database using the documented procedure.
- [ ] Compare recipe/favorite counts and verify field values in the UI after reload.
- [ ] Repeat with duplicate slugs and malformed records; verify the chosen conflict policy and failure reporting.
- [ ] Record the tested procedure and backup retention policy before production use.

## Open Decision

Choose whether recovery for v1 will use the app's future JSON restore or a documented database-provider restore procedure. Either approach needs a successful recovery drill; export-only has not yet demonstrated that data can be recovered. Hosting/provider selection remains open.
