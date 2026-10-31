import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully!");

    server = app.listen(PORT, () => {
      console.log(`Rateora API running at http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    await prisma.$disconnect();
    process.exitCode = 1;
  }
}

async function shutdown() {
  console.log("Shutting down Rateora API...");

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await prisma.$disconnect();
  console.log("Database disconnected.");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();