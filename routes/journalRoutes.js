// const express = require("express");
// const router = express.Router();
// const {
//   createJournal,
//   getMyJournals,
//   deleteJournal, // ✅ DELETE route new
// } = require("../controllers/journalController");
// const authMiddleware = require("../middleware/authenticateUser");

// router.post("/writeJournal", authMiddleware, createJournal);
// router.get("/myJournals", authMiddleware, getMyJournals);
// router.delete("/:id", authMiddleware, deleteJournal); // ✅ DELETE route new

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createJournal,
  getMyJournals,
  deleteJournal,
  updateJournal, // ✅ DELETE route new
} = require("../controllers/journalController");
const authMiddleware = require("../middleware/authenticateUser");

router.post("/writeJournal", authMiddleware, createJournal);
router.get("/myJournals", authMiddleware, getMyJournals);
router.delete("/:id", authMiddleware, deleteJournal); // ✅ DELETE route new
router.put("/:id", authMiddleware, updateJournal); // ✅ New PUT route

module.exports = router;