import { beforeEach, describe, expect, it, vi } from "vitest";
import { LEGACY_RECOVERY_KEY, preserveLegacyData } from "@/lib/legacyRecovery";

const storage = new Map<string, string>();
const setItem = vi.fn((key: string, value: string) => { storage.set(key, value); });
vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem });

beforeEach(() => {
    storage.clear();
    setItem.mockClear();
});

describe("legacy recovery archive", () => {
    it("retains different local versions and unknown fields without duplicating retries", () => {
        const old = { slug: "rice", title: "Old rice", personalNote: "Keep this" };
        const newer = { ...old, title: "New rice" };
        preserveLegacyData([old], ["rice"]);
        preserveLegacyData([old], ["rice"]);
        expect(setItem).toHaveBeenCalledTimes(1);
        preserveLegacyData([newer], ["soup"]);
        expect(JSON.parse(storage.get(LEGACY_RECOVERY_KEY)!)).toEqual({
            version: 1, recipes: [old, newer], favoriteRecipeSlugs: ["rice", "soup"],
        });
    });

    it.each(["{broken", "null", '{"version":2}', '{"version":1,"recipes":[],"favoriteRecipeSlugs":[1]}'])(
        "does not overwrite an unreadable archive: %s", (raw) => {
            storage.set(LEGACY_RECOVERY_KEY, raw);
            expect(() => preserveLegacyData([{ slug: "rice" }])).toThrow();
            expect(storage.get(LEGACY_RECOVERY_KEY)).toBe(raw);
            expect(setItem).not.toHaveBeenCalled();
        }
    );
});
