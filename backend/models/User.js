const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false — passwordHash is never returned in normal queries.
    // Callers must explicitly opt-in with .select("+passwordHash").
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    university: {
      type: String,
      trim: true,
    },
    campus: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: Number,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    profileImage: {
      type: String,
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
    },
    isProfilePublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
