
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Ensure JWT_SECRET is available from .env
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register Validation Schema
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

// Login Validation Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const { error } = registerSchema.validate({ name, email, password });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
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
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

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
      message: "Login successful!",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while logging in the user." });
  }
});

// Refresh Token Route (optional, if you plan to handle refresh tokens)
router.post("/refresh-token", (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token: newToken });
  } catch (ex) {
    res.status(400).json({ error: "Invalid refresh token." });
  }
});

module.exports = router;
