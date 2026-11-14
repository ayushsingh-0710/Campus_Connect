import mongoose from "mongoose";

const hackathonBookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
      index: true,
    },
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: [true, "Hackathon reference is required"],
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks for the same user and hackathon
hackathonBookmarkSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

export const HackathonBookmark =
  mongoose.models.HackathonBookmark || mongoose.model("HackathonBookmark", hackathonBookmarkSchema);

export default HackathonBookmark;
