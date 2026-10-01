# Recipe Vault Project Status

This document summarizes where Recipe Vault stands, what direction it is moving in, and what decisions still need to be made before the first practical launch.

It is meant to be a durable project reference, not a calendar estimate.

## Product Direction

Recipe Vault is being built as a personal recipe manager for a single-user MVP. The first launch should support a shared recipe collection that works from a desktop browser and an iPhone, with persistent recipe data stored in a database.

The goal is not a public multi-user product yet. The goal is a reliable private or low-exposure household tool that can be opened like a normal website and added to an iPhone Home Screen.

The current product shape is:

- Store and browse recipes.
- Create, edit, and delete custom recipes.
- Search recipes by title, ingredient, or time category.
- Mark recipes as favorites.
- Add recipe ingredients to a grocery list.
- Export a JSON backup of recipes and favorites.
- Prepare the app for hosted deployment with a production database.

## Current State

The app is a Next.js App Router project using React, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, and Vitest.

The codebase has moved past the early local-only prototype stage. Recipe CRUD and favorites are now database-backed. The remaining localStorage usage is mostly transitional or intentionally scoped to the grocery list.

Current local development support includes:

- Local Prisma Postgres startup scripts.
- Prisma migrations and seed data.
- Environment validation.
- A health check endpoint.
- A health smoke-test script for local or deployed environments.
- A full preflight command for env checks, schema validation, lint, tests, and production build.

## What Works Today

### Recipe Management

Recipes can be created, viewed, edited, and deleted through database-backed API routes.

The database stores:

- Recipe title.
- Stable slug.
- Time category: `fast`, `medium`, or `slow`.
- Structured ingredients.
- Cook instructions.
- Optional cookbook title.
- Optional page number.

The edit flow can still handle older localStorage recipes, but database recipes are now the primary path.

### Starter Data And Migration

Built-in starter recipes live in `data/recipes.ts` and can be seeded into the database with `npm run db:seed`.

Older browser-saved recipes can still be imported into the database through the homepage import bridge. This keeps earlier local data from being stranded while the app finishes moving to a database-first model.

### Favorites

Favorites are database-backed through the `FavoriteRecipe` table.

Older localStorage favorites are imported into the database when possible. The app still reads both local and database favorites during the transition so existing browser state does not disappear unexpectedly.

### Grocery List

The grocery list works and remains localStorage-backed.

Current grocery behavior includes:

- Add ingredients from a recipe.
- Track which recipes contributed to the grocery list.
- Remove a recipe and its contributed ingredients.
- Combine matching grocery items by ingredient and unit.
- Check purchased items.
- Clear purchased items.
- Clear the entire grocery list.

This is useful locally, but it does not sync across devices yet.

### Search And Homepage Organization

The homepage supports searching by:

- Recipe title.
- Ingredient name.
- Time category.

Homepage recipe grouping separates grocery recipes, favorite recipes, and the remaining main recipe list so the same recipe is not shown repeatedly in multiple sections.

Recipes are also sorted by grocery ingredient matches, which helps surface recipes that overlap with current grocery items.

### Backup

The app can export database recipes and favorite slugs as a JSON backup from `/api/recipes/export`.

This is a good first safety mechanism, but it is export-only. There is no general restore UI yet.

### iPhone And Home Screen Readiness

The app has:

- App metadata.
- Web app manifest.
- Home Screen icons.
- Mobile-safe layout work.
- Dark theme metadata.

The remaining iPhone work depends on deploying the app to a real URL and testing it in Safari.

## Architecture

The app currently follows this rough shape:

```text
Pages and components
      ->
Hooks
      ->
Service and API client modules
      ->
Next.js API routes
      ->
Prisma / PostgreSQL
```

Important boundaries:

- UI pages render flows and collect user input.
- Hooks coordinate page-level state and database/localStorage loading.
- `lib/recipeService.ts` owns recipe grouping, filtering, sorting, and form-to-recipe conversion.
- `lib/recipeValidation.ts` owns recipe form validation.
- `lib/recipeApi.ts` and `lib/favoriteApi.ts` call API routes.
- API routes own server-side database writes and reads.
- Prisma schema owns the persisted data model.

This separation is a good direction for maintainability. The app is no longer relying only on page components to hold important business rules.

## Persistence Model

### Database-Backed

The following are now stored in PostgreSQL:

- Recipes.
- Ingredients.
- Favorites.

### Browser localStorage

The following still use browser localStorage:

- Grocery list items.
- Grocery recipe tracking.
- Older saved recipes until imported.
- Older favorites until imported.

The most important remaining localStorage decision is whether grocery list sync matters for launch. If the grocery list should be shared between desktop and iPhone, it needs to move into the database. If recipe entry is mostly desktop and cooking is mostly phone-based after recipes are already saved, local grocery state may be acceptable for v1.

## Current Verification

The project has a reasonable verification baseline for this stage.

Commands:

- `npm run check:env`
- `npm run check`
- `npm run preflight`
- `npm run smoke:health`
- `npm run db:migrate:status`
- `npm run db:migrate:deploy`

Current automated test coverage includes:

- Recipe utilities.
- Recipe validation.
- Recipe service behavior.
- Recipe storage helpers.
- Grocery list behavior.
- Favorites behavior.
- Database recipe mapping.
- Recipe API client behavior.
- Favorite API client behavior.
- Recipe create, update, delete, import, and export API routes.
- Favorite and favorite import API routes.
- Health check API route.

The test suite is unit/API focused. There are no full browser end-to-end tests yet.

## Settled Scope For MVP

These are the current working assumptions:

- Single-user MVP.
- One shared recipe collection.
- No full account system before first launch unless private access becomes a hard requirement.
- PostgreSQL remains the main persistence layer.
- Recipes and favorites should be database-backed.
- Grocery list can remain localStorage for v1 unless cross-device grocery sync becomes required.
- Prefer free or low-cost hosting/database options first.
- The app needs a real hosted URL before it can be added to an iPhone Home Screen in a useful way.

## Open Decisions

These decisions still need final say before launch:

### Hosting And Database Provider

The app needs a hosted Next.js environment and a hosted Postgres database.

The likely requirement is simple: low cost, low maintenance, and enough reliability for one household user.

### Access And Privacy

If the app is deployed to a public URL without authentication, anyone with the URL could potentially use it. That may be acceptable for an early private-link MVP, or it may require a basic protection strategy.

Possible approaches:

- Rely on an unadvertised URL for the first pass.
- Add simple authentication before launch.
- Use hosting-level protection if the provider supports it.

This should be decided before putting real personal recipe data into production.

### Grocery List Sync

The grocery list currently does not sync between desktop and phone.

The launch decision is whether that is acceptable. Moving grocery list state into the database would make the app more consistent across devices, but it adds schema, API, UI state, and migration work.

### Data Migration Into Production

Before launch, the project needs a clear path for getting useful local data into the hosted database.

Options include:

- Seed starter recipes only.
- Use the existing localStorage import bridge from the deployed app.
- Export a local backup and add a restore/import path later.
- Manually seed or import data during deployment.

### Backup And Restore

Export exists. Restore does not.

For a single-user MVP, export may be enough at first, but a restore path would make the app safer once production data matters.

## Risks And Constraints

### No Hosted Production Yet

Until the app is deployed, it cannot meet the desktop-plus-iPhone goal.

### localStorage Is Device-Specific

Anything still in localStorage will not follow the user across devices. That mostly affects grocery list state and old migration bridges.

### No Authentication Yet

This keeps the app simple, but it is a privacy and edit-safety risk once deployed.

### Production Backups Are Not Yet Defined

The JSON export helps, but hosted database backup policy will depend on the provider.

### Build Requires Network For Fonts

The current Next.js build fetches Google fonts through `next/font`. Local sandboxed builds can fail when network access is unavailable. This has not been a code failure, but it is worth remembering.

### No End-To-End Tests Yet

The unit and API coverage is useful, but it does not fully prove real browser workflows such as add, edit, delete, export, and iPhone layout.

## Recommended Path Forward

### 1. Decide Deployment Direction

Choose the hosting and database approach.

The decision should consider:

- Free-tier limits.
- Whether the database sleeps.
- Whether the app sleeps.
- Environment variable support.
- Migration workflow.
- Backup options.
- Whether private access is possible without much complexity.

This is the next major decision because many remaining launch tasks depend on it.

### 2. Create Hosted Database

Once a provider is chosen:

- Create the hosted Postgres database.
- Add production `DATABASE_URL`.
- Run `npm run db:migrate:deploy`.
- Seed starter recipes or import existing data.
- Run `npm run db:migrate:status`.

### 3. Deploy The App

Deploy the Next.js app with the production environment variables.

After deployment:

- Run `npm run preflight` locally before pushing release changes.
- Run `APP_URL="https://..." npm run smoke:health`.
- Smoke test homepage, detail, add, edit, delete, favorites, export, and grocery list.

### 4. Test iPhone Home Screen Use

On iPhone Safari:

- Open the deployed URL.
- Confirm layout is usable.
- Add to Home Screen.
- Confirm launch icon, title, theme color, and standalone display behavior.
- Test recipe browsing and cooking flow from the Home Screen version.

### 5. Decide Whether Grocery List Sync Is Needed For v1

If grocery sync is required, add a database-backed grocery list before launch.

If not, keep grocery localStorage for v1 and document that grocery state is per-device.

### 6. Add Launch Safety

Before real use, consider:

- A manual backup routine.
- A restore/import path for backups.
- A basic privacy/access strategy.
- Better production-facing error messages.
- A small manual smoke-test checklist.

## MVP Definition Of Done

The app is ready for the first practical launch when:

- It is deployed to a stable URL.
- It is connected to a hosted Postgres database.
- Production migrations have run successfully.
- Starter or real recipe data is present.
- Health smoke test passes against production.
- Basic recipe CRUD works in production.
- Favorites work in production.
- Backup export works in production.
- iPhone Safari and Home Screen behavior have been tested.
- Privacy/access expectations are acceptable for the first user.
- Any localStorage limitations are understood and acceptable.

## Near-Term Best Next Step

The next best step is to make the deployment provider decision. The app is now prepared enough that more local setup polish has diminishing returns.

If that decision still needs time, useful non-blocking work remains:

- Add a manual launch smoke-test checklist.
- Improve production error copy.
- Add backup restore planning.
- Add basic browser workflow tests.
- Polish mobile grocery-list layout.
- Decide whether grocery list sync should move into the database before launch.
