const express = require("express");
const Exercise = require("../models/Exercise");
const Workout = require("../models/Workout");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new workout
router.post("/", protect, async (req, res) => {
  const { name, exercises } = req.body;

  // Validate input
  if (!name || !Array.isArray(exercises)) {
    return res.status(400).json({ message: "Name and exercises are required" });
  }

  try {
    const workout = new Workout({
      userId: req.user._id,
      name,
      exercises,
    });
    await workout.save();
    res.status(201).json(workout); // Return the created workout
  } catch (error) {
    console.error("Error creating workout:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Fetch all workouts
router.get("/", protect, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id });

    // Populate exercises for each workout
    const populatedWorkouts = await Promise.all(
      workouts.map(async (workout) => {
        const exercises = await Exercise.find({
          id: { $in: workout.exercises },
        });
        return {
          ...workout.toObject(),
          exercises,
        };
      })
    );

    res.status(200).json(populatedWorkouts); // Return all workouts with exercises
  } catch (error) {
    console.error("Error fetching workouts:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Fetch a specific workout by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json(workout); // Return the found workout
  } catch (error) {
    console.error("Error fetching workout:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// Update a specific workout by ID
router.put("/:id", protect, async (req, res) => {
  const { name, exercises } = req.body;

  try {
    const workout = await Workout.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      {
        name,
        exercises,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json(workout); // Return the updated workout
  } catch (error) {
    console.error("Error updating workout:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// Delete a specific workout by ID
router.delete("/:id", protect, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted successfully" }); // Return success message
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router; // Export the router
