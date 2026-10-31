
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";
import storeRoutes from "./routes/store.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Security and request parsing middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner", ownerRoutes);


// Basic route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Rateora API",
  });
});

// API routes (must come after body parsing)
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
