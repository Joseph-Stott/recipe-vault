# Manual Smoke Test Checklist

Use this checklist before calling a local build or deployed environment ready for real use.

## Local Preflight

- [ ] Run `npm run check:env`.
- [ ] Run `npm run check`.
- [ ] Run `npm run preflight`.
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
- [ ] Edit Recipe updates a database recipe.
- [ ] Delete Recipe removes a database recipe.
- [ ] Export Backup downloads JSON from `/api/recipes/export`.

## Favorites

- [ ] Favorite a recipe from the detail page.
- [ ] Unfavorite a recipe from the detail page.
- [ ] Favorite recipes appear on the homepage.
- [ ] Favorite errors show a user-facing status message if the database is unavailable.

## Grocery List

- [ ] Add a recipe to the grocery list.
- [ ] Grocery list page shows added ingredients.
- [ ] Matching grocery items combine by ingredient and unit.
- [ ] Check and uncheck grocery items.
- [ ] Clear purchased items.
- [ ] Remove a recipe from the homepage grocery section.
- [ ] Clear the full grocery list.

## Deployed Environment

- [ ] Run `APP_URL="https://your-deployed-site.example" npm run smoke:health`.
- [ ] Confirm production migrations have run with `npm run db:migrate:status`.
- [ ] Repeat the core recipe, favorites, grocery list, and backup checks against the deployed URL.

## iPhone Home Screen

- [ ] Open the deployed URL in iPhone Safari.
- [ ] Confirm homepage, recipe detail, add/edit form, and grocery list layouts are usable.
- [ ] Add the site to the Home Screen.
- [ ] Confirm the app name, icon, and standalone display look correct.
- [ ] Confirm the Home Screen version can browse recipes and open the grocery list.
