const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (ex) {
    if (ex.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please log in again." });
    }
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authenticateUser;
