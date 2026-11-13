export const STORAGE_LABELS = {
    "saved-recipes": "Older browser recipes",
    "favorite-list": "Older browser favorites",
    "grocery-list": "Grocery items",
    "grocery-recipe-slugs": "Grocery recipe selections",
    "recipe-vault:legacy-recovery:v1": "Legacy recovery archive",
} as const;

export type BrowserStorageKey = keyof typeof STORAGE_LABELS;

export class BrowserStorageError extends Error {
    constructor(
        public readonly key: BrowserStorageKey,
        public readonly reason: "invalid" | "unavailable",
        public readonly raw: string | null = null,
    ) {
        super(reason === "invalid" ? "Browser data could not be read" : "Browser storage is unavailable");
        this.name = "BrowserStorageError";
    }
}

export function readBrowserValue(key: BrowserStorageKey): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        throw new BrowserStorageError(key, "unavailable");
    }
}

export function parseBrowserValue<T>(key: BrowserStorageKey, raw: string, validate: (value: unknown) => boolean): T {
    try {
        const value: unknown = JSON.parse(raw);
        if (validate(value)) return value as T;
    } catch {
        // Preserve the exact input for download and an explicit recovery decision.
    }
    throw new BrowserStorageError(key, "invalid", raw);
}

export function resetDamagedBrowserEntry(error: BrowserStorageError) {
    if (error.reason !== "invalid" || error.raw === null) {
        throw new Error("This entry cannot be reset while browser storage is unavailable.");
    }
    // Another tab may have repaired the data while the recovery screen was open.
    if (readBrowserValue(error.key) !== error.raw) {
        throw new Error("This data changed since the error. Choose Retry to read the current version.");
    }
    try {
        localStorage.removeItem(error.key);
    } catch {
        throw new Error("Browser storage could not be changed. The entry was not reset.");
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isStoredSlugList(value: unknown) {
    return Array.isArray(value) && value.every((slug) => typeof slug === "string");
}

function isStoredIngredient(value: unknown): boolean {
    // Legacy amounts may be strings; business validation still occurs on save/import.
    return isRecord(value) && typeof value.name === "string" && typeof value.unit === "string" &&
        (typeof value.amount === "string" || (typeof value.amount === "number" && Number.isFinite(value.amount)));
}

export function isStoredRecipeList(value: unknown) {
    return Array.isArray(value) && value.every((recipe) => isRecord(recipe) &&
        typeof recipe.slug === "string" && typeof recipe.title === "string" &&
        ["fast", "medium", "slow"].includes(recipe.timeCategory as string) &&
        (recipe.structuredIngredients === undefined ||
            (Array.isArray(recipe.structuredIngredients) && recipe.structuredIngredients.every(isStoredIngredient))) &&
        (recipe.cookInstructions === undefined ||
            (Array.isArray(recipe.cookInstructions) && recipe.cookInstructions.every((step) => typeof step === "string"))) &&
        (recipe.cookBook == null || typeof recipe.cookBook === "string") &&
        (recipe.pageNumber == null || typeof recipe.pageNumber === "string" ||
            (typeof recipe.pageNumber === "number" && Number.isFinite(recipe.pageNumber)))
    );
}

export function isStoredGroceryList(value: unknown) {
    return Array.isArray(value) && value.every((item) => isRecord(item) && isStoredIngredient(item) &&
        (item.id == null || typeof item.id === "string") &&
        (item.checked == null || typeof item.checked === "boolean")
    );
}
