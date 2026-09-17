import { existsSync, readFileSync } from "node:fs";

const envFilePath = ".env";
const allowedDatabaseProtocols = new Set(["postgres:", "postgresql:"]);
const placeholderPattern = /\b(USER|PASSWORD|HOST|PORT|DATABASE|SHADOW_DATABASE)\b/;

function readEnvFile(path) {
    if (!existsSync(path)) {
        return {};
    }

    return readFileSync(path, "utf8")
        .split(/\r?\n/)
        .reduce((values, line) => {
            const trimmedLine = line.trim();

            if (!trimmedLine || trimmedLine.startsWith("#")) {
                return values;
            }

            const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

            if (!match) {
                return values;
            }

            const [, key, rawValue] = match;
            const value = rawValue
                .trim()
                .replace(/^['"]|['"]$/g, "");

            return {
                ...values,
                [key]: value,
            };
        }, {});
}

function validatePostgresUrl(name, value, errors) {
    if (!value) {
        errors.push(`${name} is required.`);
        return;
    }

    if (placeholderPattern.test(value)) {
        errors.push(`${name} still contains placeholder text.`);
        return;
    }

    try {
        const parsedUrl = new URL(value);

        if (!allowedDatabaseProtocols.has(parsedUrl.protocol)) {
            errors.push(`${name} must use a postgres:// or postgresql:// URL.`);
        }

        if (!parsedUrl.hostname) {
            errors.push(`${name} must include a database host.`);
        }
    } catch {
        errors.push(`${name} must be a valid database URL.`);
    }
}

const fileEnv = readEnvFile(envFilePath);
const env = {
    ...fileEnv,
    ...process.env,
};
const errors = [];

validatePostgresUrl("DATABASE_URL", env.DATABASE_URL, errors);

if (env.SHADOW_DATABASE_URL) {
    validatePostgresUrl("SHADOW_DATABASE_URL", env.SHADOW_DATABASE_URL, errors);
}

if (errors.length > 0) {
    console.error("Environment check failed:");
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log("Environment check passed.");
console.log(`Loaded DATABASE_URL from ${process.env.DATABASE_URL ? "environment" : envFilePath}.`);
