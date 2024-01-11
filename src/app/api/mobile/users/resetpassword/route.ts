import { connect } from "@/dbConfig/mongooseConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { sendEmail } from "@/helpers/mailer";
import { emailType } from "@/constants/emailTypes";

connect()

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json()
        const { email } = reqBody

        const user = await User.findOne({ email });

        if (user) {
            await sendEmail({ email, type: emailType.RESET_PASSWORD, user })
        }

        return NextResponse.json({
            status: "success",
            message: "Password reset email sent successfully",
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}