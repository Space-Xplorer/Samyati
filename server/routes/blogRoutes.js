const express = require("express");
const multer = require("multer");
const Blog = require("../models/Blog");
const clerkAuth = require("../middleware/clerkAuth");
const router = express.Router();

// Configure Multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all blog posts
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    // Convert Buffer to base64 for images
    const blogsWithImages = blogs.map(blog => ({
      ...blog._doc,
      image: blog.image ? blog.image.toString("base64") : null
    }));
    res.send(blogsWithImages);
  } catch (error) {
    res.status(500).send();
  }
});

const authenticate = async (req, res, next) => {
  try{
    const token = req.header('Authorization').replace('Bearer ', '');
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
}

// Create blog post with authentication
router.post("/", clerkAuth, upload.single("image"), async (req, res) => {
  try {
    console.log("Authenticated user ID:", req.auth.userId);
    
    const newBlog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: req.auth.userId, // Use Clerk user ID
      image: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      } : null
    });

    const savedBlog = await newBlog.save();
    console.log("Saved blog:", savedBlog);
    
    res.status(201).json({
      message: "Blog created successfully",
      blog: {
        _id: savedBlog._id,
        title: savedBlog.title,
        author: savedBlog.author
      }
    });
  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(400).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Like a blog
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    blog.likes.push(req.user._id);
    await blog.save();
    res.send(blog);
  } catch (error) {
    res.status(400).send();
  }
});

// Add comment
router.post("/:id/comment", authenticate, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    blog.comments.push({
      text: req.body.text,
      author: req.user._id
    });
    await blog.save();
    res.send(blog);
  } catch (error) {
    res.status(400).send();
  }
});



module.exports = router;
