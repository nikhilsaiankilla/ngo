import { runDailyCleanup } from "@/actions/cron";
import { NextRequest, NextResponse } from "next/server";

// Response types
interface CronResponse {
    success: boolean;
    message: string;
    error?: string;
    executionTime?: number;
    metrics?: {
        memoryUsage: number;
        cpuTime: number;
    };
}

// Main handler
export async function GET(req: NextRequest): Promise<NextResponse<CronResponse>> {
    const startTime = performance.now();
    const startCpu = process.cpuUsage();

    try {
        // Check CRON_SECRET
        if (!process.env.CRON_SECRET) {
            console.log("Server configuration error: CRON_SECRET not configured");
            return NextResponse.json(
                { success: false, message: "Server configuration error", error: "CRON_SECRET not configured" },
                { status: 500 }
            );
        }

        // Validate authorization
        const auth = req.headers.get("authorization");
        const expected = `Bearer ${process.env.CRON_SECRET}`;
        if (!auth || auth !== expected) {
            console.log("Unauthorized access attempt");
            return NextResponse.json(
                { success: false, message: "Unauthorized", error: "Invalid or missing authorization token" },
                { status: 401 }
            );
        }

        // Execute cleanup
        await runDailyCleanup();

        const executionTime = Math.round(performance.now() - startTime);
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
        const cpu = process.cpuUsage(startCpu);
        const cpuTime = (cpu.user + cpu.system) / 1000; // ms

        return NextResponse.json({
            success: true,
            message: "Daily cleanup executed successfully",
            executionTime,
            metrics: {
                memoryUsage: Number(memoryUsage.toFixed(2)),
                cpuTime: Number(cpuTime.toFixed(2)),
            },
        });

    } catch (error) {
        // Handle specific error types
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.log(`Cron execution failed: ${errorMessage}`);

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

// Handle CORS preflight for testing
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*", // Adjust to specific origins for better security if needed
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Authorization",
        },
    });
}

// Prevent other HTTP methods
export async function POST(req: NextRequest): Promise<NextResponse> {
    return NextResponse.json(
        { success: false, message: "Method not allowed. Use GET request." },
        { status: 405 }
    );
}