import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs";

connect()

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        const user = await User.findOne({
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({
                status: "error",
                message: "Error updating password.",
            }, { status: 400 });
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        user.password = hashedPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({
            status: "success",
            message: "Password updated successfully.",
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}