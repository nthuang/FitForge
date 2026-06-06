const rateLimit = require("express-rate-limit");

const skip = () => process.env.NODE_ENV === "test";

// Applied to every /api route as a baseline guard against abuse.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    message: { message: "Too many requests, please try again later." },
});

// Tighter limit for auth endpoints to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
});

// AI generation is expensive (per-call LLM cost), so it gets the strictest limit.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI generation limit reached, please try again later." },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };