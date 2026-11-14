import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";
import { hackathonSyncService } from "./services/hackathonSyncService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Initialize scheduled cron jobs (Brabble 6-hourly, API.SH daily 3:00 AM)
    hackathonSyncService.initScheduledSync();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
