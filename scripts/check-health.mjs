const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const healthCheckTimeoutMs = 10_000;

function formatResponseBody(responseBody) {
    if (!responseBody) {
        return "<empty response>";
    }

    if (responseBody.length <= 500) {
        return responseBody;
    }

    return `${responseBody.slice(0, 500)}...`;
}

function parseJsonResponse(responseBody) {
    try {
        return JSON.parse(responseBody);
    } catch {
        throw new Error(
            `Health endpoint did not return JSON: ${formatResponseBody(responseBody)}`
        );
    }
}

function isExpectedHealthResponse(health) {
    return (
        typeof health === "object" &&
        health !== null &&
        health.status === "ok" &&
        health.database === "reachable"
    );
}

async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`Request timed out after ${timeoutMs}ms.`);
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

let healthUrl;

try {
    healthUrl = new URL("/api/health", appUrl);
} catch {
    console.error("Health check failed.");
    console.error("APP_URL must be a valid URL.");
    process.exit(1);
}

try {
    const response = await fetchWithTimeout(
        healthUrl,
        {
            headers: {
                Accept: "application/json",
            },
        },
        healthCheckTimeoutMs
    );
    const responseBody = await response.text();
    const health = parseJsonResponse(responseBody);

    if (!response.ok) {
        throw new Error(
            `Expected HTTP 200, received HTTP ${response.status}: ${formatResponseBody(responseBody)}`
        );
    }

    if (!isExpectedHealthResponse(health)) {
        throw new Error(
            `Unexpected health response: ${formatResponseBody(responseBody)}`
        );
    }

    console.log(`Health check passed: ${healthUrl.href}`);
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`Health check failed: ${healthUrl.href}`);
    console.error(message);
    process.exit(1);
}
