const express = require("express")
const multer = require("multer")
const Blog = require("../models/Blog")
const User = require("../models/User")
const clerkAuth = require("../middleware/clerkAuth")
const router = express.Router()

// Configure Multer for image upload
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Get all blog posts
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 })

    // Transform the blogs to include base64 encoded images
    const blogsWithFormattedImages = blogs.map((blog) => {
      const blogObj = blog.toObject()

      if (blogObj.image && blogObj.image.data) {
        return {
          ...blogObj,
          image: {
            contentType: blogObj.image.contentType,
            data: blogObj.image.data.toString("base64"),
          },
        }
      }
      return blogObj
    })

    res.json(blogsWithFormattedImages)
  } catch (error) {
    console.error("Error fetching blogs:", error)
    res.status(500).json({ error: "Failed to fetch blogs" })
  }
})

// Create blog post with authentication
router.post("/", clerkAuth, upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body)
    console.log("File:", req.file)
    console.log("Auth user:", req.auth)

    if (!req.body.title || !req.body.content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    // Get user info for author details
    const user = await User.findOne({ clerkId: req.auth.userId })
    const authorUsername = user ? user.username : "Unknown Author"

    const newBlog = new Blog({
      title: req.body.title,
      content: req.body.content,
      author: req.auth.userId, // Use Clerk user ID
      authorUsername: authorUsername, // Store username for display
      image: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          }
        : null,
    })

    const savedBlog = await newBlog.save()
    console.log("Blog saved successfully:", savedBlog._id)

    res.status(201).json({
      message: "Blog created successfully",
      blog: {
        _id: savedBlog._id,
        title: savedBlog.title,
        author: savedBlog.author,
        authorUsername: savedBlog.authorUsername,
      },
    })
  } catch (error) {
    console.error("Blog creation error:", error)
    res.status(400).json({
      error: error.message,
    })
  }
})

// Get a single blog post
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    const blogObj = blog.toObject()

    if (blogObj.image && blogObj.image.data) {
      blogObj.image = {
        contentType: blogObj.image.contentType,
        data: blogObj.image.data.toString("base64"),
      }
    }

    // Get author details if not already included
    if (!blogObj.authorUsername && blogObj.author) {
      try {
        const author = await User.findOne({ clerkId: blogObj.author })
        if (author) {
          blogObj.authorUsername = author.username
        }
      } catch (err) {
        console.error("Error fetching author details:", err)
      }
    }

    // Get comment author usernames if not already included
    if (blogObj.comments && blogObj.comments.length > 0) {
      for (let i = 0; i < blogObj.comments.length; i++) {
        if (!blogObj.comments[i].authorUsername && blogObj.comments[i].author) {
          try {
            const commentAuthor = await User.findOne({ clerkId: blogObj.comments[i].author })
            if (commentAuthor) {
              blogObj.comments[i].authorUsername = commentAuthor.username
            }
          } catch (err) {
            console.error("Error fetching comment author details:", err)
          }
        }
      }
    }

    res.json(blogObj)
  } catch (error) {
    console.error("Error fetching blog:", error)
    res.status(500).json({ error: "Failed to fetch blog" })
  }
})

// Update a blog post (edit)
router.put("/:id", clerkAuth, upload.single("image"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Check if the user is the author of the blog
    if (blog.author !== req.auth.userId) {
      return res.status(403).json({ error: "You can only edit your own blogs" })
    }

    // Update blog fields
    blog.title = req.body.title || blog.title
    blog.content = req.body.content || blog.content

    // Update image if provided
    if (req.file) {
      blog.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      }
    }

    await blog.save()

    res.json({
      message: "Blog updated successfully",
      blog: {
        _id: blog._id,
        title: blog.title,
        content: blog.content,
      },
    })
  } catch (error) {
    console.error("Error updating blog:", error)
    res.status(500).json({ error: "Failed to update blog" })
  }
})

// Like a blog
router.post("/:id/like", clerkAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Check if user already liked the blog
    if (blog.likes.includes(req.auth.userId)) {
      return res.status(400).json({ error: "You already liked this blog" })
    }

    blog.likes.push(req.auth.userId)
    await blog.save()

    res.json({ message: "Blog liked successfully", likesCount: blog.likes.length })
  } catch (error) {
    console.error("Error liking blog:", error)
    res.status(500).json({ error: "Failed to like blog" })
  }
})

// Add comment
router.post("/:id/comment", clerkAuth, async (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({ error: "Comment text is required" })
    }

    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Get user info for comment author details
    const user = await User.findOne({ clerkId: req.auth.userId })
    const authorUsername = user ? user.username : "Anonymous"

    blog.comments.push({
      text: req.body.text,
      author: req.auth.userId,
      authorUsername: authorUsername,
    })

    await blog.save()

    res.json({
      message: "Comment added successfully",
      comment: blog.comments[blog.comments.length - 1],
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
})

module.exports = router

