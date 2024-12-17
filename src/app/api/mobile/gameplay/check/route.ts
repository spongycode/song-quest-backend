import Question from "@/models/question";
import Game from "@/models/game";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/mongooseConfig";
import { calculateScore } from "@/helpers/score";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { gameId, questionId, answer, timeTaken } = reqBody;
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

        if (question.answer === answer) {
            score = calculateScore(Number(timeTaken));
            isCorrect = true;
            game.accurate++;
            game.score += score;
            await game.save();
        }


        question.totalAttempts += 1;
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