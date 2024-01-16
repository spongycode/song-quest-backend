import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Game from "@/models/game";
import { connect } from "@/dbConfig/mongooseConfig";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { accessToken } = reqBody;

        if (!accessToken) {
            return NextResponse.json({
                status: "error",
                message: "Invalid input format",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        const userId = decodedToken._id;

        const games = await Game.find({ player: userId, isGameSaved: true }).select("-isGameSaved -expireAt");

        return NextResponse.json({
            status: "success",
            message: "List of played games",
            data: {
                games
            }
        }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}