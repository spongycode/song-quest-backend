import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { initializeFirebaseApp } from "@/dbConfig/firebaseConfig";
import { connect } from "@/dbConfig/mongooseConfig";
import Question from "@/models/question";


const { storage } = initializeFirebaseApp();

connect();

export async function GET() {
    try {

        const questions = await Question.find();

        return NextResponse.json({
            status: "success",
            data: questions,
            message: "Random question fetch successful",
        }, { status: 200 });
    } catch (err) {
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
