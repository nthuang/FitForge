const rateLimit = require("express-rate-limit");

// Disable rate limiting during tests so the suite isn't throttled.
const skip = () => process.env.NODE_ENV === "test";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { message: "Too many authentication attempts, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { message: "AI generation limit reached, please try again later." },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };