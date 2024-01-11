import Question from "@/models/question";
import Game from "@/models/game";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connect } from "@/dbConfig/mongooseConfig";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { accessToken, category, count } = reqBody;

        if (!accessToken || !category || !count || count === 0) {
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
                message: "User unauthorized",
            }, { status: 401 });
        }

        const questions = await Question.find({ category }).limit(count).sort({ difficulty: 1 }).select("-correctOptionId -totalAttempts -difficulty -altText");

        let isMoreQuestion = true;
        if (questions.length < count) {
            isMoreQuestion = false;
        }

        const game = await Game.create({
            player: user._id,
            questionsId: questions,
            category
        });

        return NextResponse.json({
            status: "success",
            message: "Game created successfully",
            data: {
                game,
                isMoreQuestion,
                questions
            }
        }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}