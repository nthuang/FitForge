const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workouts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workout",
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
