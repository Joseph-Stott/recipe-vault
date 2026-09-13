import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
    $queryRaw: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    default: prisma,
}));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns ok when the database is reachable", async () => {
        prisma.$queryRaw.mockResolvedValue([
            {
                result: 1,
            },
        ]);

        const response = await GET();

        expect(response.status).toBe(200);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
        expect(await response.json()).toEqual({
            status: "ok",
            database: "reachable",
        });
    });

    it("returns unavailable when the database check fails", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        prisma.$queryRaw.mockRejectedValue(new Error("database down"));

        const response = await GET();

        expect(response.status).toBe(503);
        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
        expect(await response.json()).toEqual({
            status: "error",
            database: "unreachable",
        });
        expect(consoleError).toHaveBeenCalledTimes(1);

        consoleError.mockRestore();
    });
});
