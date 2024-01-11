import { connect } from "@/dbConfig/mongooseConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { emailType } from "@/constants/emailTypes";
import { sendEmail } from "@/helpers/mailer";
import jwt from "jsonwebtoken";

connect()

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.nextUrl.searchParams.get('accessToken');

        if (!accessToken) {
            return NextResponse.json({
                status: "error",
                message: "Invalid input format",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        const userId = decodedToken._id;


        const user = await User.findById(userId);

        if (user) {
            if (user.isEmailVerfied === false) {
                const email = user.email;
                await sendEmail({ email, type: emailType.VERIFY_EMAIL, user });
            }

            return NextResponse.json({
                status: "success",
                message: "Email has been sent successfully"
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