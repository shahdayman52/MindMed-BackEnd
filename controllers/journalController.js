const Journal = require("../models/journal");

// exports.createJournal = async (req, res) => {
//   try {
//     const { content, sentiment } = req.body;

//     if (!content || !sentiment) {
//       return res
//         .status(400)
//         .json({ message: "Content and sentiment required" });
//     }

//     const journal = new Journal({
//       user: req.user.id, // from JWT middleware
//       content,
//       sentiment,
//     });

//     await journal.save();
//     res.status(201).json(journal);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//✅ NEW: Create a journal entry with title, content, and sentiment
exports.createJournal = async (req, res) => {
  try {
    console.log("🔥 Journal POST hit");
    console.log("👉 Body:", req.body);
    console.log("👉 User:", req.user);

    const { title, content, sentiment } = req.body;

    if (!title || !content || !sentiment) {
      return res
        .status(400)
        .json({ message: "Title, content, and sentiment are required." });
    }

    const journal = new Journal({
      user: req.user.id,
      title,
      content,
      sentiment,
    });

    await journal.save();
    res.status(201).json(journal);
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all journals for the authenticated user
exports.getMyJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.status(200).json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//✅delete a journal entry by ID
exports.deleteJournal = async (req, res) => {
  try {
    console.log("🚨 DELETE journal route hit");
    console.log("🧾 Journal ID:", req.params.id);
    console.log("🔐 User ID from token:", req.user.id);

    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    await Journal.deleteOne({ _id: req.params.id, user: req.user.id });

    console.log("✅ Journal deleted");
    res.status(200).json({ message: "Journal deleted successfully" });
  } catch (err) {
    console.error("🔥 DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
