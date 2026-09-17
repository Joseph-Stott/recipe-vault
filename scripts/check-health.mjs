const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const healthUrl = new URL("/api/health", appUrl);

try {
    const response = await fetch(healthUrl, {
        headers: {
            Accept: "application/json",
        },
    });
    const responseBody = await response.text();
    const health = JSON.parse(responseBody);

    if (!response.ok) {
        throw new Error(
            `Expected HTTP 200, received HTTP ${response.status}: ${responseBody}`
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
