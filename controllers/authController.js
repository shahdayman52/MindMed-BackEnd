// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dns = require("dns").promises;

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
// const registerUser = async (req, res) => {
//   const { name, email, password } = req.body;
//   email = email.toLowerCase(); // 👈 normalize to lowercase edit caseSensitive

//   const registerSchema = Joi.object({
//     name: Joi.string()
//       .min(2)
//       .max(50)
//       .pattern(/^[a-zA-Z\s'-]+$/)
//       .required(),
//     email: Joi.string().email().required(),
//     password: Joi.string()
//       .min(8)
//       .max(64)
//       .pattern(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])/)
//       .required(),
//   });
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already in use." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully!" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred while registering the user." });
//   }
// };

// // Login User
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//     email = email.toLowerCase(); 

//   // Login Validation Schema
//   const loginSchema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//   });
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: "Invalid email or password." });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: "Invalid email or password." });
//     }

//     console.log("SIGNING with JWT_SECRET:", process.env.JWT_SECRET);

//     // const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
//     //   expiresIn: "1h",
//     // });
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" } // Adjust the expiration time as needed
//     );

//     res.status(200).json({
//       token: token,
//       user: {
//         _id: user._id, // Ensure _id is included
//         name: user.name, // Ensure name is included
//         email: user.email, // Include email if necessary
//       },
//     });

//     // res.status(200).json({ message: "Login successful!", token });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "An error occurred while logging in the user." });
//   }
// };

const registerUser = async (req, res) => {
  let { name, email, password } = req.body;
  console.log("Incoming request data:", { name, email, password });
  email = email.toLowerCase(); // ✅ normalize
   const registerSchema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .max(64)
      .pattern(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])/)
      .required(),
  });

  const { error } = registerSchema.validate({ name, email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // ✅ MX validation
  const domain = email.split("@")[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid email domain (no mail server found)." });
    }
  } catch (err) {
    console.error("DNS check error:", err.message);
    return res
      .status(400)
      .json({ error: "Invalid email domain (check failed)." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while registering the user." });
  }
};

// Login Route
const loginUser = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase(); // ✅ normalize

    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

   res.status(200).json({
      token: token,
      user: {
        _id: user._id, // Ensure _id is included
        name: user.name, // Ensure name is included
        email: user.email, // Include email if necessary
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while logging in the user." });
  }
};

//--------------------------------------OTP PART-------------------------------------------------------------
const Otp = require("../models/otp");

const sendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email });
    await new Otp({ email, otpHash, expiresAt }).save();

    console.log("📧 Preparing to send OTP to:", email);
    console.log("🧠 OTP generated (visible for testing):", otp);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g. shahd.sender@gmail.com
        pass: process.env.EMAIL_PASS, // your Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"MindMed Support" <${process.env.EMAIL_USER}>`, // Name + email
      to: email,
      subject: "Your OTP Code for MindMed",
      text: `Hello,\n\nYour OTP is: ${otp}\n\nIt will expire in 10 minutes.`,
    });

    console.log("✅ OTP email sent to:", email);
    res.json({ message: "OTP sent to email." });
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
    email = email.toLowerCase(); 
  try {
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "No OTP found." });

    const isExpired = record.expiresAt < new Date();
    if (isExpired) return res.status(400).json({ message: "OTP expired." });

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP." });

    res.json({ message: "OTP verified." });
  } catch (err) {
    res.status(500).json({ message: "Verification failed." });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  email = email.toLowerCase(); 
  // First: Check general length using Joi
  const basicValidation = Joi.string().min(8).max(64).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password cannot exceed 64 characters.",
  });

  const { error } = basicValidation.validate(newPassword);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Second: Custom checks for content
  const missingRules = [];
  if (!/[A-Z]/.test(newPassword)) missingRules.push("one uppercase letter");
  if (!/[a-z]/.test(newPassword)) missingRules.push("one lowercase letter");
  if (!/[0-9]/.test(newPassword)) missingRules.push("one number");
  if (!/[@$!%*?&#]/.test(newPassword))
    missingRules.push("one special character (@$!%*?&#)");

  if (missingRules.length > 0) {
    return res.status(400).json({
      message: `Password must include at least ${missingRules.join(", ")}.`,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    await Otp.deleteMany({ email }); // Invalidate OTP after use

    res.json({ message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed." });
  }
};

//--------------------------------------------------------OTP PART--------------------------------------------------------

module.exports = router;
module.exports = { registerUser, loginUser, sendOTP, verifyOTP, resetPassword };


