import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";
import { emailType } from "@/constants/emailTypes";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { fullName, username, email, password } = reqBody;

        if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
            return NextResponse.json({
                status: "error",
                message: "Please fill all fields.",
            }, { status: 400 });
        }

        let user = await User.findOne({ username: username });
        if (user) {
            return NextResponse.json({
                status: "error",
                message: "Username already taken.",
            }, { status: 409 });
        }

        user = await User.findOne({ email: email });

        if (user) {
            return NextResponse.json({
                status: "error",
                message: "Email already exists. Please login.",
            }, { status: 409 });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);


        user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await User.findById(user._id).select("_id fullName username email");

        await sendEmail({ email, type: emailType.VERIFY_EMAIL, user: savedUser });

        return NextResponse.json({
            status: "success",
            message: "User created successfully",
            data: savedUser
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}