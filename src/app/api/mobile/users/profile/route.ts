import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function PATCH(request: NextRequest) {
    try {

        const reqBody = await request.json();
        const { accessToken, username } = reqBody;

        if (!accessToken) {
            return NextResponse.json({
                status: "error",
                message: "Access token is required",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        const userId = decodedToken._id;

        const user = await User.findById(userId);
        if (username && username !== "") {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return NextResponse.json({
                    status: "error",
                    message: "Username already exists"
                }, { status: 400 });
            } else {
                user.username = username;
                await user.save();
            }
        }

        const updatedUser = await User.findById(userId);


        return NextResponse.json({
            status: "success",
            message: "Details updated successfully",
            data: {
                user: {
                    _id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    gamesPlayed: updatedUser.gamesPlayed
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
