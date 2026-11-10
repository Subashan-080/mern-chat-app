function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource ID" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: "A record with that value already exists" });
  }

  console.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
