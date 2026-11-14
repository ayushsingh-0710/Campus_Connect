const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  getStudentsHandler,
  getStudentByIdHandler,
} = require("../controllers/user.controller");

const router = express.Router();

// All discovery endpoints require a logged-in user
router.use(protect);

// GET /api/users           — Discover students (search + filter + paginate)
router.get("/", getStudentsHandler);

// GET /api/users/:id       — View a single public student profile
router.get("/:id", getStudentByIdHandler);

module.exports = router;
