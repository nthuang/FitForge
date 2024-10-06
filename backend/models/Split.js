const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workouts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workout" }],
});

module.exports = mongoose.model("Split", splitSchema);
