const express = require("express");
const Split = require("../models/Split");

const router = express.Router();

// Create a new split
router.post("/", async (req, res) => {
  const { name, workouts } = req.body;

  try {
    const newSplit = new Split({ name, workouts });
    await newSplit.save(); // Save the new split to the database
    res.status(201).json(newSplit); // Return the created split
  } catch (error) {
    console.error("Error creating split:", error);
    res.status(500).json({ message: "Server Error", error }); // Handle errors
  }
});

// Fetch all splits
router.get("/", async (req, res) => {
  try {
    const splits = await Split.find().populate("workouts"); // Populate workouts
    res.status(200).json(splits); // Return all splits
  } catch (error) {
    console.error("Error fetching splits:", error);
    res.status(500).json({ message: "Server Error", error }); // Handle errors
  }
});

// Fetch a specific split by ID
router.get("/:id", async (req, res) => {
  try {
    const split = await Split.findById(req.params.id).populate("workouts");

    if (!split) {
      return res.status(404).json({ message: "Split not found" }); // Handle not found
    }

    res.status(200).json(split); // Return the found split
  } catch (error) {
    console.error("Error fetching split:", error);
    res.status(500).json({ message: "Server Error", error }); // Handle errors
  }
});

// Update a specific split by ID
router.put("/:id", async (req, res) => {
  const { name, workouts } = req.body;

  try {
    const split = await Split.findByIdAndUpdate(
      req.params.id,
      { name, workouts },
      { new: true } // Return the updated split
    ).populate("workouts");

    if (!split) {
      return res.status(404).json({ message: "Split not found" }); // Handle not found
    }

    res.status(200).json(split); // Return the updated split
  } catch (error) {
    console.error("Error updating split:", error);
    res.status(500).json({ message: "Server Error", error }); // Handle errors
  }
});

// Delete a specific split by ID
router.delete("/:id", async (req, res) => {
  try {
    const split = await Split.findByIdAndDelete(req.params.id);

    if (!split) {
      return res.status(404).json({ message: "Split not found" }); // Handle not found
    }

    res.status(200).json({ message: "Split deleted successfully" }); // Return success message
  } catch (error) {
    console.error("Error deleting split:", error);
    res.status(500).json({ message: "Server Error", error }); // Handle errors
  }
});

module.exports = router; // Export the router
