//moodlog controller
const MoodLog = require("../models/moodlog");

exports.logMood = async (req, res) => {
  const { mood } = req.body;
  const userId = req.user.id; // assuming you're using JWT auth

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time part

    const existingLog = await MoodLog.findOne({ user: userId, date: today });

    if (existingLog) {
      return res
        .status(400)
        .json({ message: "Mood already logged for today." });
    }

    const newLog = new MoodLog({
      user: userId,
      mood,
      date: today,
    });

    await newLog.save();
    res.status(201).json({ message: "Mood logged successfully!", log: newLog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all mood logs for the logged-in user
exports.getMoodLogs = async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await MoodLog.find({ user: userId }).sort({ date: -1 });

    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//new code till the end

const mongoose = require("mongoose");

exports.getMoodStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month; // e.g., "2025-02"

    const matchStage = { user: new mongoose.Types.ObjectId(userId) };

    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      matchStage.date = { $gte: start, $lt: end };
    }

    const stats = await MoodLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add this below getMoodStats
exports.getWeeklyMoodStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month; // Expected format: "2025-04"

    if (!month) {
      return res.status(400).json({ message: "Month is required." });
    }

    const [year, monthIndex] = month.split("-").map(Number);
    const start = new Date(year, monthIndex - 1, 1);
    const end = new Date(year, monthIndex, 0, 23, 59, 59);

    const logs = await MoodLog.find({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    const moodLevels = {
      Unpleasant: 1,
      Neutral: 2,
      Pleasant: 3,
    };

    const weeklyMap = {};

    logs.forEach((log) => {
      const day = new Date(log.date).getDate();
      const week = Math.ceil(day / 7); // Week 1–5

      const moodValue = moodLevels[log.mood];
      if (!weeklyMap[week]) weeklyMap[week] = [];
      weeklyMap[week].push(moodValue);
    });

    const results = [];
    for (let i = 1; i <= 5; i++) {
      const values = weeklyMap[i] || [];
      const average =
        values.length > 0
          ? values.reduce((sum, val) => sum + val, 0) / values.length
          : 0;

      results.push({ week: i, moodAvg: parseFloat(average.toFixed(2)) });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Weekly mood stats error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// moodController.js

exports.getMoodStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const moods = await MoodLog.find({ user: userId }).sort({ date: -1 });

    let streak = 0;
    let currentDate = new Date();

    for (let MoodLog of moods) {
      const moodDate = new Date(MoodLog.date);
      const daysDiff = Math.floor(
        (currentDate - moodDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0 || daysDiff === 1) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};