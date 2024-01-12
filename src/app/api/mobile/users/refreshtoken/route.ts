import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {

        const reqBody = await request.json();
        const { refreshToken } = reqBody;

        if (!refreshToken) {
            return NextResponse.json({
                status: "error",
                message: "Refresh token is required.",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
        const userId = decodedToken._id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({
                status: "error",
                message: "Token expired",
            }, { status: 401 });
        }

        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });


        return NextResponse.json({
            status: "success",
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email
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