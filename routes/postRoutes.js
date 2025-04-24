//post routes
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");
const auth = require("../middleware/authenticateUser");

//post routes
router.post("/createPost", auth, postController.createPost);
router.get("/allPosts", postController.getAllPosts);
router.get("/myPosts", auth, postController.getMyPosts);
router.post("/:id/relate", auth, postController.relatePost);
router.delete("/:id", auth, postController.deletePost);


//Comments routes

router.post("/addComment/:postId", auth, postController.addComment);
router.get("/getComment/:postId", postController.getCommentsForPost);
router.delete("/deleteComment/:commentId", auth, postController.deleteComment); // Now the same as delete post
module.exports = router;

