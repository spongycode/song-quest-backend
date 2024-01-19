import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";
import { emailType } from "@/constants/emailTypes";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { username, email, password } = reqBody;

        if ([email, username, password].some((field) => field?.trim() === "")) {
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
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await User.findById(user._id).select("_id username email");

        // await sendEmail({ email, type: emailType.VERIFY_EMAIL, user: savedUser });
        await sendEmail({ email, type: emailType.NORMAL_WELCOME, user: savedUser });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user._id);

        return NextResponse.json({
            status: "success",
            message: "User created successfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    _id: savedUser._id,
                    username: savedUser.username,
                    email: savedUser.email
                }
            }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}

const generateAccessToken = (user: any) => {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        username: user.username
    },
        process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
}

const generateRefreshToken = (userId: String) => {
    return jwt.sign({ _id: userId, },
        process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
}