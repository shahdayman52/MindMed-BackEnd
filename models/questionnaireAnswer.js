const mongoose = require("mongoose");

const questionnaireAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // So each user only submits once
  },
  answers: {
    type: [String],
    required: true,
  },
  stressLevel: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model(
  "QuestionnaireAnswer",
  questionnaireAnswerSchema
);
