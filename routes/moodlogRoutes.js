//moodlog routes
const express = require("express");
const router = express.Router();
const moodController = require("../controllers/moodlogController");
const authMiddleware = require("../middleware/authenticateUser"); // ensure the user is authenticated

router.post("/log-mood", authMiddleware, moodController.logMood);
router.get("/my-moods", authMiddleware, moodController.getMoodLogs); 

//new 
router.get("/stats", authMiddleware, moodController.getMoodStats);
router.get("/weekly-stats", authMiddleware, moodController.getWeeklyMoodStats);


router.get("/streak", authMiddleware, moodController.getMoodStreak);
module.exports = router;
