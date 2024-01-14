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
    isGameSaved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expireAt: {
        type: Date,
        default: Date.now()
    }
})

gameSchema.index(
    { expireAt: 1 },
    {
        name: "unsaved-deletion",
        partialFilterExpression: { isGameSaved: false },
        expireAfterSeconds: 180
    }
);

const Game = mongoose.models.games || mongoose.model("games", gameSchema);

export default Game;