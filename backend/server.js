const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const exerciseRoutes = require("./routes/exercises");
const workoutRoutes = require("./routes/workouts");
const splitRoutes = require("./routes/splits");

// Load environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON requests

// API routes
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/splits", splitRoutes);

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fitforge";
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit on connection error
  });

// Default route for health check
app.get("/", (req, res) => {
  res.send("Welcome to the Workout Planner API!");
});
