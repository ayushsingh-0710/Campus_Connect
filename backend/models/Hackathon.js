import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Hackathon title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    organizer: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "demo",
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      default: "Campus Connect",
      trim: true,
      index: true,
    },
    kind: {
      type: String,
      default: "competition",
      trim: true,
    },
    sourceId: {
      type: String,
      trim: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      default: "",
    },
    shareUrl: {
      type: String,
      default: "",
    },
    registrationUrl: {
      type: String,
      default: "",
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
      index: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    countryCode: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    stateCode: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    locationType: {
      type: String,
      enum: ["domestic", "international", "unknown"],
      default: "unknown",
      index: true,
    },
    countryDetectionMethod: {
      type: String,
      enum: ["explicit_country", "verified_location_mapping", "unknown"],
      default: "unknown",
    },
    categories: {
      type: [String],
      default: [],
      index: true,
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 4 },
      label: { type: String, default: "" },
    },
    prizePool: {
      amount: { type: Number, default: null },
      currency: { type: String, default: "INR" },
      label: { type: String, default: "" },
    },
    registeredCount: {
      type: Number,
      default: null,
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    eligibility: {
      type: String,
      default: "Open to all undergraduate and graduate students.",
    },
    status: {
      type: String,
      enum: ["Open", "Closing Soon", "Closed", "Upcoming"],
      default: "Open",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure deduplication across external sources
hackathonSchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true });

// Text index for search functionality across multiple fields
hackathonSchema.index({
  title: "text",
  organizer: "text",
  description: "text",
  categories: "text",
  technologies: "text",
});

export const Hackathon = mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema);
export default Hackathon;
