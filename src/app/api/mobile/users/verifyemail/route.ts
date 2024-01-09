import { connect } from "@/dbConfig/mongooseConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";

connect()

export async function GET(request: NextRequest) {

    try {
        const token = request.nextUrl.searchParams.get('token');

        const user = await User.findOne({
            verifyEmailToken: token,
            verifyEmailTokenExpiry: { $gt: Date.now() }
        });

        if (user) {
            user.isEmailVerfied = true;
            user.verifyEmailToken = undefined;
            user.verifyEmailTokenExpiry = undefined;
            await user.save();

            return NextResponse.json({
                status: "success",
                message: "Email verified successfully",
            }, { status: 200 })
        } else {
            return NextResponse.json({
                status: "error",
                message: "Invalid token",
            }, { status: 401 })
        }
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}


