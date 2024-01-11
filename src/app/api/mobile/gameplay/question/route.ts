import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { initializeFirebaseApp } from "@/dbConfig/firebaseConfig";
import { connect } from "@/dbConfig/mongooseConfig";
import Question from "@/models/question";
import Game from "@/models/game";
import User from "@/models/user";
import jwt from "jsonwebtoken";


const { storage } = initializeFirebaseApp();

connect();

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.nextUrl.searchParams.get('accessToken');
        const gameId = request.nextUrl.searchParams.get('gameId');
        const count = Number(request.nextUrl.searchParams.get('count'));

        if (!accessToken || !gameId || !count || count === 0) {
            return NextResponse.json({
                status: "error",
                message: "Invalid input format",
            }, { status: 400 });
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
        const userId = decodedToken._id;

        const user = await User.findById(userId);
        const game = await Game.findById(gameId);
        const category = game.category;

        if (!user || !game || !user._id.equals(game.player)) {
            return NextResponse.json({
                status: "error",
                message: "Invalid combination of user and game",
            }, { status: 400 });
        }

        let questions = await Question.find({
            category,
            _id: { $nin: game.questionsId }
        }).limit(count).sort({ difficulty: 1 }).select("-correctOptionId -totalAttempts -difficulty -altText");

        let isMoreQuestion = true;
        if (questions.length < count) {
            isMoreQuestion = false;
        }

        game.questionsId.push(...questions);
        game.save();

        return NextResponse.json({
            status: "success",
            message: "Question fetched successfully",
            data: {
                game,
                isMoreQuestion,
                questions
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        let file = formData.get("file") as File;
        const details = formData.get("details");

        const storageRef = ref(storage, `${uuidv4()}.mp3`);
        const metadata = {
            contentType: 'audio/mp3',
        };

        if (!file) {
            throw new Error("File is missing");
        }

        const { title, options, correctOptionId, category, altText } = JSON.parse(details as string);
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const songUrl = await getDownloadURL(snapshot.ref);

        const newQuestion = new Question({
            title,
            songUrl,
            options,
            correctOptionId,
            category,
            altText
        });

        const savedQuestion = await newQuestion.save();

        return NextResponse.json({
            status: "success",
            data: savedQuestion,
            message: "Question saved successfully",
        }, { status: 200 });
    } catch (err) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}
