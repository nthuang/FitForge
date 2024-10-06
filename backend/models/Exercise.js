const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  id: Number,
  name: String,
  bodyPart: String,
  equipment: String,
  target: String,
  gifUrl: String,
});

module.exports = mongoose.model("Exercise", exerciseSchema);
