import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import hackathonRoutes from "./routes/hackathonRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import Hackathon from "./models/Hackathon.js";
import { hackathonSyncService } from "./services/hackathonSyncService.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8443";

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin === CLIENT_ORIGIN
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development (safeguard: never logs API keys)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith("/api")) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Root & Health check endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Campus Connect API Server",
    timestamp: new Date().toISOString(),
  });
});

// Mount Hackathons API
app.use("/api/hackathons", hackathonRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server and connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demo records if collection is completely empty
    const count = await Hackathon.countDocuments();
    if (count === 0) {
      console.log("[Auto-Seed] No hackathon records found. Seeding initial demo data...");
      await hackathonSyncService.syncFromProvider("demo");
    } else {
      console.log(`[Database] Found ${count} existing hackathon records in database.`);
    }

    // Initialize 6-hour cron synchronization job
    hackathonSyncService.initScheduledSync();

    // If key is configured and sync enabled, run initial background sync
    if (
      process.env.HACKATHON_API_KEY &&
      process.env.HACKATHON_SYNC_ENABLED === "true"
    ) {
      console.log("[Auto-Sync] Initiating background sync with Brabble API...");
      hackathonSyncService
        .syncFromProvider("brabble", { limit: 200 })
        .then((stats) => {
          console.log(`[Auto-Sync] Live sync complete. Total in batch: ${stats.total || 0}`);
        })
        .catch((err) => {
          console.warn("[Auto-Sync] Background sync notice:", err.message);
        });
    }

    app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`  🚀 Campus Connect Backend API Server Running    `);
      console.log(`  📡 Port: http://localhost:${PORT}             `);
      console.log(`  🏥 Health Check: http://localhost:${PORT}/api/health `);
      console.log(`  🏆 Hackathons:  http://localhost:${PORT}/api/hackathons`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error("[Fatal Error] Server failed to start:", error);
    process.exit(1);
  }
};

startServer();

export default app;
