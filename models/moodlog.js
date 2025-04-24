const mongoose = require("mongoose");

const moodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["Pleasant", "Neutral", "Unpleasant"],
      required: true,
    },
    date: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0), // store date without time
      required: true,
    },
  },
  { timestamps: true }
);

moodLogSchema.index({ user: 1, date: 1 }, { unique: true }); // ensure one mood log per day

module.exports = mongoose.model("MoodLog", moodLogSchema);
