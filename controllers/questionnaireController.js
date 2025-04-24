//questionaire controller 
const QuestionnaireAnswer = require("../models/questionnaireAnswer");
const User = require("../models/user");

const submitQuestionnaire = async (req, res) => {
  const { userId, answers, stressLevel } = req.body;

  if (!userId || !answers || !stressLevel) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const existing = await QuestionnaireAnswer.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Questionnaire already submitted." });
    }

    const newAnswer = new QuestionnaireAnswer({ userId, answers, stressLevel });
await User.findByIdAndUpdate(userId, { questionnaireCompleted: true });    res.status(201).json({ message: "Questionnaire submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const submitQuestionnaire = async (req, res) => {
//   const { userId, answers, stressLevel } = req.body;

//   if (!userId || !answers || !stressLevel) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   try {
//     const existing = await QuestionnaireAnswer.findOne({ userId });
//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: "Questionnaire already submitted." });
//     }

//     const newAnswer = new QuestionnaireAnswer({ userId, answers, stressLevel });
//     await newAnswer.save(); // ✅ this line was missing

//     await User.findByIdAndUpdate(userId, { questionnaireCompleted: true }); // ✅ update after saving
//     res.status(201).json({ message: "Questionnaire submitted successfully." });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const checkIfCompleted = async (req, res) => {
  const { userId } = req.params;
  try {
const user = await User.findById(userId);
res.status(200).json({ completed: user?.questionnaireCompleted || false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { submitQuestionnaire, checkIfCompleted };
