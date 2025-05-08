// const mongoose = require("mongoose");

// const journalSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   title: { type: String, required: true }, // ✅ NEW

//   content: { type: String, required: true },
//   sentiment: {
//     type: String,
//     enum: ["Positive", "Negative", "Neutral"], // 👈 I need to confirm this
//     required: true,
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Journal", journalSchema);
const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  sentiment: {
    type: String,
    enum: ["Positive", "Negative", "Neutral"], // 🧠 Limited to these 3 values
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Journal", journalSchema);