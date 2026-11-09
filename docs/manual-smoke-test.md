# Manual Smoke Test Checklist

Use this checklist before calling a local build or deployed environment ready for real use.

## Local Preflight

- [ ] Run `npm run preflight` (environment, schema, TypeScript, lint, unit/route tests, and build).
- [ ] Install Chromium with `npx playwright install chromium` on first use, then run `npm run test:browser` with no other development server running for this checkout.
- [ ] Review `npm audit` and `npm audit --omit=dev`; record unresolved advisories.
- [ ] Start the local database with `npm run db:dev:detach` if needed.
- [ ] Start the app with `npm run dev`.
- [ ] Run `npm run smoke:health`.

## Core Recipe Flows

- [ ] Homepage loads recipes.
- [ ] Search finds recipes by title.
- [ ] Search finds recipes by ingredient.
- [ ] Search finds recipes by time category.
- [ ] Recipe detail page opens from a recipe card.
- [ ] Add Recipe creates a database recipe.
- [ ] Enter a decimal amount such as `0.5`, save, and reload the detail page to confirm it persists.
- [ ] Invalid amounts such as `1/2` and invalid cookbook pages show an error without saving.
- [ ] Edit Recipe updates a database recipe.
- [ ] Delete Recipe removes a database recipe and it stays deleted after reload, including recipes imported from browser storage.
- [ ] Export Backup downloads JSON from `/api/recipes/export`.
- [ ] Confirm the export contains the saved recipes, ingredients, and favorite slugs. Follow the [recovery checklist](backup-restore-notes.md) before relying on the backup.

## Favorites

- [ ] Favorite a recipe from the detail page.
- [ ] Unfavorite a recipe from the detail page.
- [ ] Favorite recipes appear on the homepage.
- [ ] Unfavoriting stays effective after reload, including migrated browser favorites.
- [ ] A missing legacy favorite does not repeatedly call the import endpoint.
- [ ] Favorite errors show a user-facing status message if the database is unavailable.

## Grocery List

- [ ] Add a recipe to the grocery list.
- [ ] Grocery list page shows added ingredients.
- [ ] Matching grocery items combine by ingredient and unit.
- [ ] Check and uncheck grocery items.
- [ ] Clear purchased items.
- [ ] Remove a recipe from the homepage grocery section.
- [ ] Add a recipe, edit its ingredients, then remove it from groceries; confirm no stale ingredients or unrelated removals remain.
- [ ] Clear the full grocery list.

## Failure And Accessibility Checks

- [ ] On a disposable browser profile, malformed localStorage shows a recoverable state without silently discarding data.
- [ ] Network/database failures show useful messages and allow retry without losing a form draft.
- [ ] Keyboard users can reach and identify form controls, ingredient removal, and favorite actions.
- [ ] Long titles and ingredient names fit on narrow screens; text remains readable with light and dark system preferences.

Some of these checks expose known open issues. Record failures against [launch-todo.md](launch-todo.md); automated checks passing does not mark this checklist complete.

## Deployed Environment

- [ ] Set `APP_URL` and run `npm run smoke:health` using the [PowerShell or Bash example](../README.md#verification).
- [ ] Confirm production migrations have run with `npm run db:migrate:status`.
- [ ] Confirm unauthenticated requests cannot read, export, or modify protected data through either pages or API routes.
- [ ] Repeat the core recipe, favorites, grocery list, and backup checks against the deployed URL.
- [ ] Confirm the approved local data was transferred; the hosted origin cannot read localhost's browser storage.
- [ ] Edit a recipe and change a favorite on desktop, then reload the same hosted URL on the phone and confirm both changes.

## iPhone Home Screen

- [ ] Open the deployed URL in iPhone Safari.
- [ ] Confirm homepage, recipe detail, add/edit form, and grocery list layouts are usable.
- [ ] Add the site to the Home Screen.
- [ ] Confirm the app name, icon, and standalone display look correct.
- [ ] Confirm the Home Screen version can browse recipes and open the grocery list.
- [ ] Check data after closing and reopening Safari and the Home Screen app. Grocery state is currently browser-local, so verify the accepted behavior explicitly.
