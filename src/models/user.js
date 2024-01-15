import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    imageUrl: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isEmailVerfied: {
        type: Boolean,
        default: false,
    },
    gamesPlayed: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    verifyEmailToken: String,
    verifyEmailTokenExpiry: Date,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    refreshToken: String
})

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;