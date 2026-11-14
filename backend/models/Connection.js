import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "Status must be pending, accepted, or rejected",
      },
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Connection =
  mongoose.models.Connection || mongoose.model("Connection", connectionSchema);
export default Connection;
