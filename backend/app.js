const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/user.routes");
const connectionRoutes = require("./routes/connection.routes");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Cookie parsing ────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes);           // Dev 2: Student Discovery
app.use("/api/connections", connectionRoutes); // Dev 2: Connection Requests

// Developer 1: auth, users, profiles  → app.use("/api/auth",    authRoutes);
// Developer 3: hackathons, teams      → app.use("/api/hackathons", hackathonRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
