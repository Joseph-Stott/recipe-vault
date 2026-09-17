const appUrl = process.env.APP_URL ?? "http://localhost:3000";

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

let healthUrl;

try {
    healthUrl = new URL("/api/health", appUrl);
} catch {
    console.error("Health check failed.");
    console.error("APP_URL must be a valid URL.");
    process.exit(1);
}

try {
    const response = await fetch(healthUrl, {
        headers: {
            Accept: "application/json",
        },
    });
    const responseBody = await response.text();
    const health = parseJsonResponse(responseBody);

    if (!response.ok) {
        throw new Error(
            `Expected HTTP 200, received HTTP ${response.status}: ${formatResponseBody(responseBody)}`
        );
    }

    if (health.status !== "ok" || health.database !== "reachable") {
        throw new Error(
            `Unexpected health response: ${responseBody}`
        );
    }

    console.log(`Health check passed: ${healthUrl.href}`);
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`Health check failed: ${healthUrl.href}`);
    console.error(message);
    process.exit(1);
}
