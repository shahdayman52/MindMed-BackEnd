// routes/index.js

const express = require("express");
const router = express.Router();
require("dotenv").config();


// Import the auth routes
const authRoutes = require("./authRoutes");
const postRoutes = require("./postRoutes");
const moodlogRoutes = require("./moodlogRoutes");
const journalRoutes = require("./journalRoutes");
const questionnaireRoutes = require("./questionnaireRoutes");




// Use auth routes for `/api/auth` paths
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/mood", moodlogRoutes);
router.use("/journal", journalRoutes);
router.use("/questionnaire", questionnaireRoutes);




module.exports = router;
