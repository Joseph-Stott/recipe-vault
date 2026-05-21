export type Recipe = {
    slug: string;
    title: string;
    timeCategory: "fast" | "medium" | "slow";
    ingredientsList: string[];
    cookInstructions?: string[];
    cookBook?: string;
    pageNumber?: number;
    matchCount?: number;
    isFavorite?: boolean;
};