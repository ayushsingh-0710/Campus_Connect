import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getStudentsHandler,
  getStudentByIdHandler,
} from "../controllers/user.controller.js";

const router = express.Router();

// All discovery endpoints require a logged-in user
router.use(protect);

// GET /api/users           — Discover students (search + filter + paginate)
router.get("/", getStudentsHandler);

// GET /api/users/:id       — View a single public student profile
router.get("/:id", getStudentByIdHandler);

export default router;
