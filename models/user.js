const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^@]+@[^@]+\.[^@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 64,
  },
  questionnaireAnswers: {
    type: Map,
    of: String,
  },
  stressLevel: {
    type: Number,
    min: 0,
    max: 10,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
