# Recipe Vault

## Overview

Recipe Vault is a recipe management web application built with Next.js, React, TypeScript, and Tailwind CSS.

Users can create, edit, organize, and browse recipes while generating a grocery list directly from recipe ingredients. The application persists user data using localStorage and demonstrates component-based architecture, structured data modeling, dynamic routing, and client-side state management.

## Key Features

### Recipe Management

* Create custom recipes
* Edit existing recipes
* Delete recipes
* Favorite recipes
* Automatic slug generation from recipe titles
* Dynamic recipe detail pages
* Persistent recipe storage using localStorage

### Structured Ingredient System

Ingredients are stored as structured objects rather than plain text.

```ts
type Ingredient = {
    amount: number | "";
    unit: string;
    name: string;
};
```

This enables:

* Ingredient validation
* Ingredient aggregation
* Flexible ingredient display
* Grocery list generation
* Future measurement-based enhancements

### Grocery List

* Add recipe ingredients to a grocery list
* Remove recipe ingredients from a grocery list
* Persistent grocery list storage
* Persistent grocery recipe tracking
* Prevent duplicate grocery recipe entries
* Grocery ingredient match counting
* Purchased item tracking
* Clear purchased items
* Automatic sorting of checked and unchecked items
* Ingredient aggregation

Example:

```text
1 cup milk
3 cups milk
```

Displays as:

```text
4 cups milk
```

### Search and Organization

* Search recipes by title
* Search recipes by ingredient name
* Search recipes by time category
* Dynamic filtering
* Grocery match indicators
* Favorite recipe prioritization
* Grocery recipe prioritization
* Empty-state messaging

### Recipe Details

* Structured ingredient display
* Cookbook support
* Page number support
* Cook instruction rendering
* Favorite toggling
* Grocery list integration

## Technical Highlights

### Reusable Components

* RecipeCard
* RecipeForm
* SearchBar
* BackButton

### Dynamic Routing

Recipe detail pages are generated using dynamic routes:

```text
/recipes/[slug]
```

### Client-Side Persistence

The application uses localStorage to persist:

* User-created recipes
* Favorite recipes
* Grocery lists
* Grocery recipe tracking

### Data Modeling

A structured ingredient model replaced a previous string-based ingredient system, enabling aggregation, validation, and more flexible rendering throughout the application.

## Technology Stack

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* localStorage

## Project Structure

```text
app/
components/
data/
lib/
types/
```

## Future Improvements

* Toast notifications
* Improved measurement conversion and aggregation
* Individual grocery recipe removal controls
* Database-backed persistence
* User accounts
* Cloud synchronization

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

in your browser.

## Purpose

Recipe Vault is an ongoing portfolio project focused on learning modern web development through incremental feature development, refactoring, and user experience improvements.
