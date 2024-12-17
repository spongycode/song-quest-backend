import Question from "@/models/question";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connect } from "@/dbConfig/mongooseConfig";

connect();

export async function POST(request: NextRequest) {
    try {
        const accessToken = request.nextUrl.searchParams.get('accessToken');

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
                message: "User unauthorized",
            }, { status: 401 });
        }

        const radio = await Question.aggregate([
            { $match: { songUrl: { $exists: true, $ne: null }, coverUrl: { $exists: true, $ne: null } } },
            { $project: { songUrl: 1, coverUrl: 1, _id: 0 } },
            { $sample: { size: 1000000 } }
        ]);


        return NextResponse.json({
            status: "success",
            message: "Radio session created",
            data: {
                radio
            }
        }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({
            status: "error",
            message: "Internal server error occurred.",
        }, { status: 500 });
    }
}