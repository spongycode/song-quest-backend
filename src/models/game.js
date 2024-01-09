import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    player: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0.0
    },
    questionsId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }],
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Game = mongoose.models.games || mongoose.model("games", gameSchema);

export default Game;