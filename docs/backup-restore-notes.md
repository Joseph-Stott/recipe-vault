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

## Current Restore Capability

There is no general restore UI yet.

Existing import paths are narrower:

- Older browser-saved recipes can be imported into the database from the homepage.
- Older browser-saved favorites can be copied into the database.
- Starter recipes can be seeded with `npm run db:seed`.

These are migration helpers, not a full backup restore system.

## Recommended Manual Backup Routine

Before any risky production change:

- [ ] Run the production health smoke test.
- [ ] Export a backup from the deployed app.
- [ ] Confirm the downloaded JSON opens and contains recipes.
- [ ] Store the backup somewhere outside the project folder.
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

## Open Decision

Before production data matters, decide whether export-only is acceptable for v1 or whether backup restore should be added before launch.
