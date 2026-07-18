import { describe, expect, it } from "vitest";
import { createSlug } from "@/lib/recipeUtils";

describe("createSlug", () => {
    it("creates a slug from a recipe title", () => {
        expect(createSlug("Chicken Alfredo")).toBe("chicken-alfredo");
    });
    it("removes leading and trailing whitespace", () => {
        expect(createSlug("   Chicken Alfredo   ")).toBe("chicken-alfredo");
    });
    it("converts uppercase letters to lowercase", () => {
        expect(createSlug("CHICKEN ALFREDO")).toBe("chicken-alfredo");
    });
    it("removes unsupported characters", () => {
        expect(createSlug("Chicken! Alfredo?")).toBe("chicken-alfredo");
    });
    it("replaces consecutive spaces with a single hyphen", () => {
        expect(createSlug("Chicken     Alfredo")).toBe("chicken-alfredo");
    });
    it("collapses consecutive hyphens into a single hyphen", () => {
        expect(createSlug("Chicken---Alfredo")).toBe("chicken-alfredo");
    });
});