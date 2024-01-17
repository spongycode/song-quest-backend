import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Game from "@/models/game";
import { connect } from "@/dbConfig/mongooseConfig";
import User from "@/models/user";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { accessToken, categories } = reqBody;

        if (!accessToken) {
            return NextResponse.json({
                status: "error",
                message: "Invalid input format",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        const userId = decodedToken._id;

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({
                status: "error",
                message: "Invalid token",
            }, { status: 400 });
        }

        const categoryScores: any[] = [];

        for (const category of categories) {
            const topScores = await Game.find({ category })
                .find({ isGameSaved: true })
                .sort({ score: -1 })
                .populate({
                    path: 'player',
                    model: 'users',
                    select: 'username',
                })
                .select("player score accurate createdAt");

            const userScores: any = topScores.reduce((acc, { player, score, accurate, createdAt }) => {
                const username = player.username;

                if (!acc[username] || score > acc[username].score) {
                    acc[username] = {
                        username,
                        score,
                        accurate,
                        createdAt,
                    };
                }

                return acc;
            }, {});

            const categoryData = {
                category,
                users: Object.values(userScores),
            };

            categoryScores.push(categoryData);
        }

        return NextResponse.json({
            status: "success",
            message: "Category wise high score",
            data: categoryScores,
        }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}
