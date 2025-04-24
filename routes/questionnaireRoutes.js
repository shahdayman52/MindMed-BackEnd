const express = require("express");
const router = express.Router();
const {
  submitQuestionnaire,
  checkIfCompleted,
} = require("../controllers/questionnaireController");
// REMOVE /questionnaire from here!
router.post("/submit", submitQuestionnaire);
router.get("/status/:userId", checkIfCompleted);


module.exports = router;
