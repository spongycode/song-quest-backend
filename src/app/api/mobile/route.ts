import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            status: "success",
            message: "Server is up and running. 📱",
        }, { status: 200 });
    } catch (err) {
        console.error("Health check failed:", err);
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}
