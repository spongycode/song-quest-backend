import Question from "@/models/question";
import Game from "@/models/game";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/mongooseConfig";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { gameId, questionId, optionId, timeTaken } = reqBody;
        const question = await Question.findById(questionId);
        const game = await Game.findById(gameId);

        if (!game || !question) {
            return NextResponse.json({
                status: "error",
                message: "Invalid game or question id",
            }, { status: 400 });
        }

        let score = 30 - timeTaken;
        let isCorrect = true;
        if (question.correctOptionId !== optionId) {
            score = 0
            isCorrect = false;
        }

        if (isCorrect) {
            game.score += score;
            await game.save();
        }

        return NextResponse.json({
            status: "success",
            message: "Wrong answer",
            data: {
                isCorrect,
                increment: score
            }
        }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}