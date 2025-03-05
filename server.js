
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const authenticateUser = require("./middleware/authenticateUser");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
// app.use(
//   cors({
//     origin: ["http://10.0.2.2:60895", "http://127.0.0.1:61333"], // Adjust based on your frontend setup
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
app.use(
  cors({
    origin: "*", // Allow all origins for debugging
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// MongoDB Connection
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
