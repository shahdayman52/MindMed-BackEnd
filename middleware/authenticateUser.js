//middleware/authenticateUser
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

const token = authHeader.replace("Bearer ", "").trim();
console.log("Incoming Token:", token);

  try {
    console.log("VERIFYING with JWT_SECRET:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (ex) {
      console.error("JWT Error:", ex.message);

    if (ex.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please log in again." });
    }
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authenticateUser;




