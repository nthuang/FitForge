// Central error handler — must be the LAST app.use().
const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });   // bad ObjectId
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });           // mongoose validation
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Server Error" });
};

module.exports = errorHandler;