const express = require('express');
const router = express.Router();
const clerkAuth = require('../middleware/clerkAuth');
const Blog = require('../models/Blog');

// Protected route
router.post('/', clerkAuth, async (req, res) => {
  try {
    const blog = new Blog({ ...req.body, author: req.user.id });
    await blog.save();
    res.status(201).send(blog);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;