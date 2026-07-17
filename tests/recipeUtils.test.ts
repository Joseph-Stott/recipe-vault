import { describe, expect, it } from "vitest";
import { createSlug } from "@/lib/recipeUtils";

describe("createSlug", () => {
    it("creates a slug from a recipe title", () => {
        expect(createSlug("Chicken Alfredo")).toBe("chicken-alfredo");
    });
});