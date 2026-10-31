
import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Rateora API is healthy",
      services: {
        server: "running",
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Service unavailable",
      services: {
        server: "running",
        database: "disconnected",
      },
    });
  }
});

export default router;
