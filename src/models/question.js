import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    songUrl: {
        type: String
    },
    coverUrl: {
        type: String
    },
    answer: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    artist: {
        type: String
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    difficulty: {
        type: Number,
        default: 0.5
    },
    altText: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Question = mongoose.models.questions || mongoose.model("questions", questionSchema);

export default Question;