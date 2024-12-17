import Question from "@/models/question";
import Game from "@/models/game";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connect } from "@/dbConfig/mongooseConfig";

connect();

const count = 25;

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { accessToken, category } = reqBody;

        if (!accessToken || !category) {
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

        const questions = await Question.aggregate([
            { $match: { category } },
            { $sample: { size: count } }
        ]);

        const questionsWithOptions = await Promise.all(questions.map(async (question, questionIndex) => {
            const optionsPool = await Question.aggregate([
                { $match: { category, _id: { $ne: question._id } } },
                { $group: { _id: "$answer", doc: { $first: "$$ROOT" } } }, // Group by answer to ensure distinct answers
                { $sample: { size: 3 } }
            ]).then(results => results.map(result => result.doc));

            const rawOptions = [...optionsPool.map(opt => ({ _id: opt._id, value: opt.answer })),
            { _id: question._id, value: question.answer }];


            for (let i = rawOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
            }

            const options = rawOptions.map((opt, index) => ({
                _id: opt._id.toString(),
                optionid: index,
                value: opt.value
            }));

            return {
                _id: question._id,
                title: question.title,
                songUrl: question.songUrl,
                coverUrl: question.coverUrl,
                category: question.category,
                options
            };
        }));

        const totalQuestionsInCategory = await Question.countDocuments({ category });
        const isMoreQuestion = totalQuestionsInCategory > count;

        const game = await Game.create({
            player: user._id,
            questionsId: questions.map(q => q._id),
            category
        });

        return NextResponse.json({
            status: "success",
            message: "Game created successfully",
            data: {
                game,
                isMoreQuestion,
                questions: questionsWithOptions
            }
        }, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}