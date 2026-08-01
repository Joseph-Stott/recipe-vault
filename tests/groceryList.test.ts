import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    addIngredientsToGroceryList,
    getGroceryList,
} from "@/lib/groceryList";

const storage = new Map<string, string>();

vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
        storage.set(key, value);
    },
    removeItem: (key: string) => {
        storage.delete(key);
    },
    clear: () => {
        storage.clear();
    },
});

describe("groceryList", () => {
    beforeEach(() => {
        storage.clear();
    });

    it("adds new grocery items as unchecked", () => {
        addIngredientsToGroceryList([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
            },
        ]);

        expect(getGroceryList()).toEqual([
            expect.objectContaining({
                amount: 1,
                unit: "cup",
                name: "rice",
                checked: false,
            }),
        ]);
    });

    it("returns an empty grocery list when nothing is stored", () => {
        expect(getGroceryList()).toEqual([]);
    });

    it("adds missing fields to grocery items from older storage data", () => {
        storage.set(
            "grocery-list",
            JSON.stringify([
                {
                    amount: 1,
                    unit: "cup",
                    name: "rice",
                },
            ])
        );

        const groceryList = getGroceryList();

        expect(groceryList).toEqual([
            {
                amount: 1,
                unit: "cup",
                name: "rice",
                id: "1-cup-rice-0",
                checked: false,
            },
        ]);
    });
});