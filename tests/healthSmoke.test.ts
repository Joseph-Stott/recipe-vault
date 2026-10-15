import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runHealthCheck(fetchImplementation: string) {
    return spawnSync(process.execPath, [
        "--input-type=module",
        "-e",
        `globalThis.fetch = ${fetchImplementation}; await import('./scripts/check-health.mjs');`,
    ], {
        encoding: "utf8",
        env: { ...process.env, APP_URL: "http://localhost:3000", HEALTH_CHECK_TIMEOUT_MS: "50" },
        timeout: 5000,
    });
}

describe("health smoke script", () => {
    it("reports HTTP errors even when the server returns HTML", () => {
        const result = runHealthCheck(`async () => new Response('<html>Service unavailable</html>', { status: 503 })`);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Expected HTTP 200, received HTTP 503");
        expect(result.stderr).toContain("Service unavailable");
    });

    it("rejects a successful response that is not JSON", () => {
        const result = runHealthCheck(`async () => new Response('<html>Sign in</html>')`);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Health endpoint did not return JSON");
    });

    it("succeeds for a healthy response", () => {
        const result = runHealthCheck(`async () => new Response(JSON.stringify({
            status: 'ok', database: 'reachable'
        }))`);
        expect(result.status).toBe(0);
        expect(result.stdout).toContain("Health check passed");
    });

    it("times out when headers arrive but the body stalls", () => {
        const result = runHealthCheck(`async (_url, { signal }) => ({
            text: () => new Promise((_resolve, reject) => {
                signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
            })
        })`);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Request timed out after 50ms.");
    });
});
