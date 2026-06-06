const express = require("express");
const Exercise = require("../models/Exercise");

const router = express.Router();

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

    const exercises = await Exercise.aggregate([
      { $match: query },
      { $group: { _id: "$name", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { name: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
    ]);
    res.status(200).json(exercises);
});

module.exports = router;