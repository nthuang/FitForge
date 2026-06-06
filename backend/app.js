const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const path = require("path");

const exerciseRoutes = require("./routes/exercises");
const workoutRoutes = require("./routes/workouts");
const splitRoutes = require("./routes/splits");
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const { apiLimiter, authLimiter, aiLimiter } = require("./middleware/rateLimiters");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(bodyParser.json({ limit: "1mb" }));

app.use("/api", apiLimiter);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/splits", splitRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

// Serve the React build + SPA catchall
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

module.exports = app;