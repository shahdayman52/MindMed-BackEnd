//post controllers
const Post = require("../models/post");
const express = require("express");

const router = express.Router();
const createPost = async (req, res) => {
  console.log("📥 POST BODY:", req.body);
  console.log("🔐 USER FROM TOKEN:", req.user);

  try {
    const post = new Post({
      content: req.body.content,
      user: req.user.id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name")
      .populate({ path: "relates", select: "name" })
      .sort({ createdAt: -1 });

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post._doc,
          relatesCount: post.relates.length,
          commentsCount,
        };
      })
    );

    // ✅ Sort by commentsCount descending
    postsWithCounts.sort((a, b) => b.commentsCount - a.commentsCount);

    res.json(postsWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }) // 👈 only this user
      .populate("user", "name")
      .populate("relates", "name")
      .sort({ createdAt: -1 });

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post._doc,
          relatesCount: post.relates.length,
          commentsCount,
        };
      })
    );

    res.json(postsWithCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ message: "User not authorized" });

    await Comment.deleteMany({ post: req.params.id });
    await Post.deleteOne({ _id: req.params.id });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/postsController.js
const Comment = require("../models/comment"); // Your comment model

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId); // Ensure it correctly finds the comment
    console.log("🔐 req.user.id:", req.user.id);
    console.log("🧾 comment.user:", comment.user);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // await comment.delete(); // Delete the comment
    await Comment.deleteOne({ _id: comment._id }); // ✅ works reliably
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const relatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    const hasReacted = post.relates.includes(userId);

    if (hasReacted) {
      // Remove the user's reaction
      post.relates = post.relates.filter((id) => id.toString() !== userId);
    } else {
      // Add the user's reaction
      post.relates.push(userId);
    }

    await post.save();

    // ✅ Populate relates so the frontend sees full user info
    const populatedPost = await Post.findById(post._id)
      .populate("user", "name")
      .populate("relates", "name");

    res.json(populatedPost);
  } catch (err) {
    console.error("❌ relatePost error:", err);
    res.status(500).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const comment = new Comment({
      text: req.body.text,
      user: req.user.id,
      post: req.params.postId,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommentsForPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = router;
module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  relatePost,
  addComment,
  getCommentsForPost,
  deletePost,
  deleteComment,
};
