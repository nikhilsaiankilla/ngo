import { runDailyCleanup } from "@/actions/cron";
import { CronResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/daily
 * Secured cron endpoint to trigger daily cleanup.
 */
export async function GET(req: NextRequest): Promise<NextResponse<CronResponse>> {
    const startTime = performance.now();
    const startCpu = process.cpuUsage();

    const CRON_SECRET = process.env.CRON_SECRET;
    const auth = req.headers.get("authorization");

    if (!CRON_SECRET) {
        console.error("Missing CRON_SECRET in environment variables.");
        return NextResponse.json(
            {
                success: false,
                message: "Server configuration error",
                error: "CRON_SECRET not configured",
            },
            { status: 500 }
        );
    }

    if (auth !== `Bearer ${CRON_SECRET}`) {
        console.warn("Unauthorized access attempt to CRON route.");
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
                error: "Invalid or missing authorization token",
            },
            { status: 401 }
        );
    }

    try {
        await runDailyCleanup();

        const executionTime = Math.round(performance.now() - startTime);
        const memoryUsage = Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));
        const cpu = process.cpuUsage(startCpu);
        const cpuTime = Number(((cpu.user + cpu.system) / 1000).toFixed(2));

        return NextResponse.json({
            success: true,
            message: "Daily cleanup executed successfully",
            executionTime,
            metrics: {
                memoryUsage,
                cpuTime,
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Cron execution failed:", errorMessage);

        return NextResponse.json(
            {
                success: false,
                message: "Cron execution failed",
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}

/**
 * CORS Preflight support (Optional for local testing or third-party calls)
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Authorization",
        },
    });
}

/**
 * POST (or other methods) should be rejected explicitly.
 */
export async function POST(): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, message: "Method not allowed. Use GET request." },
        { status: 405 }
    );
}
