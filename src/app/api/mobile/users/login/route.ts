import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {

        const reqBody = await request.json();
        const { username, email, password } = reqBody;

        if (!username && !email) {
            return NextResponse.json({
                status: "error",
                message: "Email or username is required.",
            }, { status: 400 });
        }

        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (!user) {
            return NextResponse.json({
                status: "error",
                message: "User does not exist.",
            }, { status: 404 });
        }


        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({
                status: "error",
                message: "Invalid user credentials.",
            }, { status: 401 });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });


        return NextResponse.json({
            status: "success",
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    gamesPlayed: user.gamesPlayed
                }
            }
        }, { status: 200 });
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
        username: user.username,
        fullName: user.fullName
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