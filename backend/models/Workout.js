const mongoose = require("mongoose");
const { Schema } = mongoose;

const workoutSchema = new Schema({
  name: { type: String, required: true },
  exercises: [{ type: Number }], 
});

module.exports = mongoose.model("Workout", workoutSchema);
