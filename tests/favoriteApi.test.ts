import { afterEach, describe, expect, it, vi } from "vitest";
import {
    getDatabaseFavoriteRecipeSlugs,
    importDatabaseFavoriteRecipeSlugs,
    toggleDatabaseFavoriteRecipe,
} from "@/lib/favoriteApi";

describe("getDatabaseFavoriteRecipeSlugs", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("fetches favorite recipe slugs", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    favoriteRecipeSlugs: ["chicken-rice"],
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        const favoriteRecipeSlugs =
            await getDatabaseFavoriteRecipeSlugs();

        expect(fetch).toHaveBeenCalledWith("/api/favorites");
        expect(favoriteRecipeSlugs).toEqual(["chicken-rice"]);
    });

    it("throws when the request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(
            getDatabaseFavoriteRecipeSlugs()
        ).rejects.toThrow("Failed to load favorites");
    });
});

describe("toggleDatabaseFavoriteRecipe", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("toggles a database favorite recipe", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    favoriteRecipeSlugs: ["chicken-rice"],
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        const favoriteRecipeSlugs =
            await toggleDatabaseFavoriteRecipe("chicken-rice");

        expect(fetch).toHaveBeenCalledWith("/api/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                recipeSlug: "chicken-rice",
            }),
        });
        expect(favoriteRecipeSlugs).toEqual(["chicken-rice"]);
    });

    it("throws when the request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(
            toggleDatabaseFavoriteRecipe("chicken-rice")
        ).rejects.toThrow("Failed to update favorite");
    });
});

describe("importDatabaseFavoriteRecipeSlugs", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("imports local favorite recipe slugs", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(
                JSON.stringify({
                    favoriteRecipeSlugs: [
                        "chicken-rice",
                        "bean-soup",
                    ],
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        );

        const favoriteRecipeSlugs =
            await importDatabaseFavoriteRecipeSlugs([
                "chicken-rice",
                "bean-soup",
            ]);

        expect(fetch).toHaveBeenCalledWith(
            "/api/favorites/import",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipeSlugs: [
                        "chicken-rice",
                        "bean-soup",
                    ],
                }),
            }
        );
        expect(favoriteRecipeSlugs).toEqual([
            "chicken-rice",
            "bean-soup",
        ]);
    });

    it("throws when the request fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, {
                status: 500,
            })
        );

        await expect(
            importDatabaseFavoriteRecipeSlugs([])
        ).rejects.toThrow("Failed to import favorites");
    });
});
