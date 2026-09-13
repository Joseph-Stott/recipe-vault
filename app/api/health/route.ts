import prisma from "@/lib/prisma";

type HealthCheckResult = {
    result: number;
};

export async function GET() {
    try {
        await prisma.$queryRaw<HealthCheckResult[]>`
            SELECT 1 AS result
        `;

        return Response.json(
            {
                status: "ok",
                database: "reachable",
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Health check failed", error);

        return Response.json(
            {
                status: "error",
                database: "unreachable",
            },
            {
                status: 503,
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    }
}
