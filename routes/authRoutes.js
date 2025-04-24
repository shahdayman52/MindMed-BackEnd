// routes/auth.js
const express = require("express");
const router = express.Router();

// Import controller functions
const {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);
//--------------------OTP Routes---------------------//
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);



module.exports = router;


