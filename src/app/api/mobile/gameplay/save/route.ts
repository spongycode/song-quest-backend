import Game from "@/models/game";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connect } from "@/dbConfig/mongooseConfig";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { accessToken, gameId } = reqBody;

        if (!accessToken || !gameId) {
            return NextResponse.json({
                status: "error",
                message: "Invalid input format",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        const userId = decodedToken._id;

        const user = await User.findById(userId);
        const game = await Game.findById(gameId);

        if (!user || !game || !user._id.equals(game.player)) {
            return NextResponse.json({
                status: "error",
                message: "Invalid combination of user and game",
            }, { status: 400 });
        }

        game.isGameSaved = true;
        await game.save();

        user.gamesPlayed++;
        await user.save();

        return NextResponse.json({
            status: "success",
            message: "Game saved successfully",
            data: {
                game
            }
        }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}