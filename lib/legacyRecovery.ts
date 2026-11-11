export const LEGACY_RECOVERY_KEY = "recipe-vault:legacy-recovery:v1";

type LegacyRecovery = {
    version: 1;
    recipes: unknown[];
    favoriteRecipeSlugs: string[];
};

const listeners = new Set<() => void>();

export function subscribeToLegacyRecovery(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.storageArea === localStorage &&
            (event.key === LEGACY_RECOVERY_KEY || event.key === null)) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
}

export function getLegacyRecoveryJson(): string | null {
    return localStorage.getItem(LEGACY_RECOVERY_KEY);
}

function readRecovery(): LegacyRecovery {
    const raw = getLegacyRecoveryJson();
    if (raw === null) return { version: 1, recipes: [], favoriteRecipeSlugs: [] };
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.recipes) ||
        !Array.isArray(value.favoriteRecipeSlugs) ||
        !value.favoriteRecipeSlugs.every((slug: unknown) => typeof slug === "string")) {
        throw new Error("Legacy recovery archive is invalid; it has not been overwritten.");
    }
    return value;
}

// Save recovery data before removing anything from the active legacy stores.
// Exact duplicates are omitted, but different versions of a recipe are retained.
export function preserveLegacyData(recipes: unknown[], favoriteRecipeSlugs: string[] = []) {
    if (recipes.length === 0 && favoriteRecipeSlugs.length === 0) return;
    const recovery = readRecovery();
    const versions = new Set(recovery.recipes.map((recipe) => JSON.stringify(recipe)));
    for (const recipe of recipes) {
        const version = JSON.stringify(recipe);
        if (!versions.has(version)) {
            recovery.recipes.push(recipe);
            versions.add(version);
        }
    }
    recovery.favoriteRecipeSlugs = [...new Set([
        ...recovery.favoriteRecipeSlugs, ...favoriteRecipeSlugs,
    ])];
    const json = JSON.stringify(recovery);
    if (json !== getLegacyRecoveryJson()) {
        localStorage.setItem(LEGACY_RECOVERY_KEY, json);
        listeners.forEach((listener) => listener());
    }
}
