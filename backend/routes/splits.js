const express = require("express");
const Split = require("../models/Split");
const Exercise = require("../models/Exercise");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new split
router.post("/", protect, async (req, res) => {
  const { name, workouts } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Split name is required" });
  }

  if (!Array.isArray(workouts)) {
    return res.status(400).json({ message: "Workouts must be an array" });
  }

    const newSplit = new Split({
      userId: req.user._id,
      name: name.trim(),
      workouts,
    });

    await newSplit.save();

    const populatedSplit = await Split.findById(newSplit._id).populate("workouts");

    res.status(201).json(populatedSplit);
});

// Fetch all splits
router.get("/", protect, async (req, res) => {
    const splits = await Split.find({ userId: req.user._id }).populate("workouts"); // Populate workouts
    res.status(200).json(splits); // Return all splits

});

// Fetch a split with full exercise details per workout (for the detail modal)
router.get("/:id/details", protect, async (req, res) => {
    const split = await Split.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("workouts");

    if (!split) {
      return res.status(404).json({ message: "Split not found" });
    }

    const splitObj = split.toObject();
    const exerciseIds = splitObj.workouts.flatMap((w) => w.exercises || []);

    if (exerciseIds.length > 0) {
      const exercises = await Exercise.find({ id: { $in: exerciseIds } });
      const byId = new Map(exercises.map((e) => [e.id, e]));
      splitObj.workouts = splitObj.workouts.map((w) => ({
        ...w,
        exercises: (w.exercises || []).map((id) => byId.get(id)).filter(Boolean),
      }));
    }

    res.status(200).json(splitObj);
});

// Fetch a specific split by ID
router.get("/:id", protect, async (req, res) => {
    const split = await Split.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("workouts");

    if (!split) {
      return res.status(404).json({ message: "Split not found" }); // Handle not found
    }

    res.status(200).json(split); // Return the found split
});

// Update a specific split by ID
router.put("/:id", protect, async (req, res) => {
  const { name, workouts } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Split name is required" });
  }

  if (!Array.isArray(workouts)) {
    return res.status(400).json({ message: "Workouts must be an array" });
  }

    const split = await Split.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        name: name.trim(),
        workouts,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("workouts");

    if (!split) {
      return res.status(404).json({ message: "Split not found" });
    }

    res.status(200).json(split);

});

// Delete a specific split by ID
router.delete("/:id", protect, async (req, res) => {
    const split = await Split.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!split) {
      return res.status(404).json({ message: "Split not found" }); // Handle not found
    }

    res.status(200).json({ message: "Split deleted successfully" }); // Return success message
});

module.exports = router; // Export the router
