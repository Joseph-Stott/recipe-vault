# Recipe Vault

## Description

Recipe Vault is a web application for storing, organizing, and browsing recipes.

## Current Functionality

- Reusable RecipeCard component
- Reusable SearchBar component
- Dynamic recipe detail pages using slugs
- Search recipes by title, cook time category, and ingredients
- Display a no-results message when no recipes match the search
- Render ingredient and cook instruction lists
- Conditionally render optional recipe metadata
- Navigation between homepage and recipe detail pages
- Clickable recipe cards
- Color-coded cook time ribbons
- Persistent custom recipe storage using localStorage
- User-created recipes with automatic slug generation
- Dynamic rendering and overriding of saved recipes
- Recipe editing with persistent localStorage updates
- Recipe deletion with confirmation prompts
- Automatic prioritization of edited recipes over built-in recipes
- De-duplication of recipe overrides using shared slugs
- Favorite recipe tracking and persistence
- Grocery list page with localStorage persistence
- Add recipe ingredients to persistent grocery list
- Persistent grocery recipe tracking using recipe slugs
- Prevent duplicate grocery recipe entries
- Dedicated grocery recipe section displayed at the top of the homepage
- Dynamic recipe sorting based on grocery list ingredients and favorites
- Dynamic grocery ingredient match counting
- Clear grocery list and grocery recipe tracking
- Confirmation prompts for add, edit, delete, and clear actions
- Responsive recipe card wrapping for grocery recipe containers
- Separate rendering of grocery-tracked recipes from the main recipe feed
- Dynamically switch between adding and removing recipes from grocery list
- Remove recipe-specific ingredients from the grocery list while preserving shared ingredients

## Planed Features (ToDo)

- Ingredient quantity parsing and merging
- Individual grocery recipe removal
- Toast notifications replacing alert/confirm dialogs
- Advanced grocery list grouping and measurement handling
- Favorite recipe prioritization improvements

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.