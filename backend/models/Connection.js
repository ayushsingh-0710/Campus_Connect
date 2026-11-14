const mongoose = require("mongoose");

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
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Compound unique index — prevents duplicate requests in the same direction
// (A → B). Reverse-direction duplicates (B → A while A → B exists) must
// be caught at the service layer when the connection logic is implemented.
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
