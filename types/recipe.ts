export type Ingredient = {
    amount: number | "";
    unit: string;
    name: string;
};

export type IngredientDraft = Omit<Ingredient, "amount"> & {
    amount: string | number;
};

export type Recipe = {
    slug: string;
    title: string;
    timeCategory: "fast" | "medium" | "slow";
    structuredIngredients: Ingredient[];
    cookInstructions?: string[];
    cookBook?: string;
    pageNumber?: number;
    matchCount?: number;
    isFavorite?: boolean;
};
