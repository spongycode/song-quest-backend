import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    songUrl: {
        type: String
    },
    options: [
        {
            optionid: {
                type: Number,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    correctOptionId: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    incorrectAttempts: {
        type: Number,
        default: 0
    },
    level: {
        type: Number
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