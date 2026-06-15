const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create comment on a post
router.post('/:postId', async (req, res) => {
  try {
    const { content, authorId, authorName } = req.body;
    if (!content || !authorId)
      return res.status(400).json({ message: 'Content and author required' });

    const comment = await Comment.create({
      post: req.params.postId,
      author: authorId,
      authorName,
      content,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE a comment (author only)
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== userId)
      return res.status(403).json({ message: 'Unauthorized' });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
