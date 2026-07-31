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
});