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

        if (!game || !question || !game.questionsId.includes(questionId)) {
            return NextResponse.json({
                status: "error",
                message: "Invalid game or question id",
            }, { status: 400 });
        }


        let score = 0;
        let isCorrect = false;

        if (question.correctOptionId === optionId) {
            score = Math.max(0, Number(process.env.CORRECT_OFFSET) * (1 - timeTaken / Number(process.env.TOTAL_TIME_PER_QUESTION)));
            isCorrect = true;
            game.score += score;
            await game.save();
        }

        let newDifficulty =
            1 - (
                (question.totalAttempts * question.difficulty + score / Number(process.env.CORRECT_OFFSET)) /
                (question.totalAttempts + 1)
            );

        question.totalAttempts += 1;
        question.difficulty = newDifficulty;
        question.save();

        game.expireAt = Date.now();
        game.save();

        return NextResponse.json({
            status: "success",
            message: (isCorrect ? "Correct" : "Wrong") + " answer",
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