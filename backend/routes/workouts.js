const express = require("express");
const Exercise = require("../models/Exercise");
const Workout = require("../models/Workout");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new workout
router.post("/", protect, async (req, res) => {
  const { name, exercises } = req.body;

  // Validate input
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Workout name is required" });
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ message: "Please select at least one exercise" });
  }


    const workout = new Workout({
      userId: req.user._id,
      name,
      exercises,
    });
    await workout.save();
    res.status(201).json(workout); // Return the created workout

});

// Fetch all workouts
router.get("/", protect, async (req, res) => {
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
});

// Fetch a specific workout by ID
router.get("/:id", protect, async (req, res) => {

    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    res.status(200).json(workout); // Return the found workout
});

// Update a specific workout by ID
router.put("/:id", protect, async (req, res) => {
  const { name, exercises } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Workout name is required" });
  }

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ message: "Please select at least one exercise" });
  }


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
});

// Delete a specific workout by ID
router.delete("/:id", protect, async (req, res) => {

    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted successfully" }); // Return success message

});

module.exports = router; // Export the router
