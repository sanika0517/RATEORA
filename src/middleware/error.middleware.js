// CENTRALIZED ERROR HANDLER
export const errorHandler = (err, req, res, next) => {
  console.error("API Error:", err);

  // Prisma duplicate record error
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this information already exists",
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Requested record not found",
    });
  }

  // Invalid UUID or database input
  if (err.code === "22P02") {
    return res.status(400).json({
      success: false,
      message: "Invalid input format",
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};