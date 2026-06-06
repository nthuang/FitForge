const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        fitnessProfile: {
            goal: {
                type: String,
                enum: ["strength", "hypertrophy", "fat_loss", "general_fitness"],
                default: "general_fitness",
            },
            experienceLevel: {
                type: String,
                enum: ["beginner", "intermediate", "advanced"],
                default: "beginner",
            },
            daysPerWeek: {
                type: Number,
                default: 3,
            },
            sessionLengthMinutes: {
                type: Number,
                default: 60,
            },
            equipment: {
                type: [String],
                default: [],
            },
            limitations: {
                type: [String],
                default: [],
            },
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);