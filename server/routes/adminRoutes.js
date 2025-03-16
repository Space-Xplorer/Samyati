const express = require("express")
const User = require("../models/User")
const Blog = require("../models/Blog")
const clerkAuth = require("../middleware/clerkAuth")
const router = express.Router()

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId })

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." })
    }

    next()
  } catch (error) {
    console.error("Admin check error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// All admin routes require authentication and admin role
router.use(clerkAuth, isAdmin)

// Get dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalBlogs = await Blog.countDocuments()
    const totalAuthors = await User.countDocuments({ role: "author" })

    // Get recent blogs
    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5)

    // Get recent users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5)

    // Get popular blogs (by likes)
    const popularBlogs = await Blog.aggregate([
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: { likesCount: -1 } },
      { $limit: 5 },
    ])

    res.status(200).json({
      stats: {
        totalUsers,
        totalBlogs,
        totalAuthors,
      },
      recentBlogs: recentBlogs.map((blog) => ({
        _id: blog._id,
        title: blog.title,
        author: blog.author,
        createdAt: blog.createdAt,
        likesCount: blog.likes.length,
        commentsCount: blog.comments.length,
      })),
      recentUsers: recentUsers.map((user) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
      popularBlogs: popularBlogs.map((blog) => ({
        _id: blog._id,
        title: blog.title,
        author: blog.author,
        createdAt: blog.createdAt,
        likesCount: blog.likesCount,
        commentsCount: blog.comments.length,
      })),
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// Delete a blog
router.delete("/blogs/:blogId", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    await blog.remove()

    res.status(200).json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Delete blog error:", error)
    res.status(500).json({ error: "Failed to delete blog" })
  }
})

// Feature a blog (add a featured flag to the Blog model)
router.put("/blogs/:blogId/feature", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // Add featured field if it doesn't exist
    if (!blog.hasOwnProperty("featured")) {
      // Update the Blog schema to include this field
      await Blog.updateOne({ _id: blog._id }, { $set: { featured: true } })
    } else {
      blog.featured = !blog.featured
      await blog.save()
    }

    res.status(200).json({
      message: `Blog ${blog.featured ? "featured" : "unfeatured"} successfully`,
      featured: blog.featured,
    })
  } catch (error) {
    console.error("Feature blog error:", error)
    res.status(500).json({ error: "Failed to feature blog" })
  }
})

module.exports = router

