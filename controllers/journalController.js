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
// exports.createJournal = async (req, res) => {
//   try {
//     console.log("🔥 Journal POST hit");
//     console.log("👉 Body:", req.body);
//     console.log("👉 User:", req.user);

//     const { title, content, sentiment } = req.body;

//     if (!title || !content || !sentiment) {
//       return res
//         .status(400)
//         .json({ message: "Title, content, and sentiment are required." });
//     }

//     const journal = new Journal({
//       user: req.user.id,
//       title,
//       content,
//       sentiment,
//     });

//     await journal.save();
//     res.status(201).json(journal);
//   } catch (err) {
//     console.error("❌ Save error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
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
    console.log("✅ Journal saved!");
    res.status(201).json(journal);
  }  catch (err) {
  console.error("❌ Save error:", err); // full error
  res.status(500).json({ message: "Server error", error: err.message });
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

const axios = require("axios"); // ✅ Make sure axios is installed: npm install axios

exports.updateJournal = async (req, res) => {
  try {
    console.log("✏️ UPDATE journal route hit");
    console.log("🆔 Journal ID:", req.params.id);
    console.log("🔐 User ID:", req.user.id);
    console.log("👉 Body:", req.body);

    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    // ✅ 1️⃣ Predict sentiment using your Flask API
    const apiUrl = "http://192.168.1.3:5003/predict"; // replace with your actual Flask API URL if different
    const apiKey = "2qPHzBAML1ICY5TpNDScAt3Rz2o_6Mj51tGzXY7XhPfGfiQTi";

    console.log("🔮 Predicting sentiment for new content...");

    let newSentiment = "Unknown";
    try {
      const sentimentResponse = await axios.post(
        apiUrl,
        { text: content },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      newSentiment = sentimentResponse.data.prediction;
      console.log("✅ Sentiment predicted:", newSentiment);
    } catch (sentimentError) {
      console.error("❌ Sentiment prediction failed:", sentimentError.message);
      return res.status(500).json({ message: "Sentiment prediction failed" });
    }

    // ✅ 2️⃣ Update title + content + sentiment
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, sentiment: newSentiment },
      { new: true } // return the updated document
    );

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    console.log("✅ Journal updated successfully");
    res.status(200).json(journal);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
