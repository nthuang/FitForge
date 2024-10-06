const express = require("express");
const axios = require("axios");
const Exercise = require("../models/Exercise");

const router = express.Router();

// Fetch exercises from the external API
router.get("/fetch", async (req, res) => {
  try {
    const response = await axios.get(
      "https://exercisedb.p.rapidapi.com/exercises",
      {
        headers: {
          "x-rapidapi-key": process.env.EXERCISE_DB_API_KEY,
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
        params: {
          limit: 9999,
        },
      }
    );

    const exercises = response.data;

    await Exercise.deleteMany({}); // Clear existing exercises

    await Exercise.insertMany(exercises); // Insert fetched exercises

    res
      .status(200)
      .json({ message: `${exercises.length} exercises fetched and stored` });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get exercises with optional search and pagination
router.get("/", async (req, res) => {
  const { search, page = 1, limit = 100 } = req.query;

  let query = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { bodyPart: { $regex: search, $options: "i" } },
        { equipment: { $regex: search, $options: "i" } },
        { target: { $regex: search, $options: "i" } },
      ],
    };
  }

  try {
    const exercises = await Exercise.aggregate([
      { $match: query },
      { $group: { _id: "$name", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { name: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
