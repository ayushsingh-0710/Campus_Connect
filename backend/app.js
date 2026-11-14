import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import hackathonRoutes from "./routes/hackathonRoutes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:8443",
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8443",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Cookie parsing ────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes);             // Dev 2: Student Discovery
app.use("/api/connections", connectionRoutes); // Dev 2: Connection Requests
app.use("/api/hackathons", hackathonRoutes);   // Dev 3: Hackathons Discovery & Synchronization

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
