const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    fitnessProfile: user.fitnessProfile,
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) { 
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        if (password.length < 8) { 
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            passwordHash,
        });

        res.status(201).json({
            token: createToken(user._id),
            user: serializeUser(user),
        });

    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
});

router.post("/login", async (req, res) => { 
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) { 
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatches) { 
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            token: createToken(user._id),
            user: serializeUser(user),
        });
    } catch (error) {
        res.status(500).json({ message: "Login Failed", error: error.message });
    }
});

router.get("/me", protect, async (req, res) => {
    res.status(200).json({
        user: serializeUser(req.user),
    });
});

module.exports = router;