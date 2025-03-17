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

// Create or update user profile
router.post("/profile", clerkAuth, async (req, res) => {
  try {
    const { email, username, bio, profileImage, socialLinks, country, languages } = req.body

    // Find user by Clerk ID or create a new one
    let user = await User.findOne({ clerkId: req.auth.userId })

    if (user) {
      // Update existing user
      user.email = email || user.email
      user.username = username || user.username
      user.bio = bio !== undefined ? bio : user.bio
      user.profileImage = profileImage || user.profileImage
      user.socialLinks = socialLinks || user.socialLinks
      user.country = country || user.country
      user.languages = languages || user.languages
    } else {
      // Create new user with default values
      user = new User({
        clerkId: req.auth.userId,
        email: email || req.auth.tokenPayload?.email || "",
        username: username || req.auth.tokenPayload?.name || "Traveler",
        bio: bio || "",
        profileImage: profileImage || "",
        socialLinks: socialLinks || {},
        country: country || "",
        languages: languages || [],
      })
    }

    await user.save()

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        country: user.country,
        languages: user.languages,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// Get user profile
router.get("/profile", clerkAuth, async (req, res) => {
  try {
    let user = await User.findOne({ clerkId: req.auth.userId })

    if (!user) {
      // Create a new user with default values from Clerk token
      user = new User({
        clerkId: req.auth.userId,
        email: req.auth.tokenPayload?.email || "",
        username: req.auth.tokenPayload?.name || "Traveler",
        bio: "",
        profileImage: "",
        socialLinks: {},
        country: "",
        languages: [],
      })

      await user.save()
    }

    res.status(200).json({
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        country: user.country,
        languages: user.languages,
        following: user.following,
        followers: user.followers,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Get public profile by Clerk ID
router.get("/profile/:clerkId", async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get user's blogs
    const blogs = await Blog.find({ author: user.clerkId }).sort({ createdAt: -1 }).limit(10)

    res.status(200).json({
      user: {
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks,
        country: user.country,
        languages: user.languages,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
      blogs: blogs.map((blog) => ({
        _id: blog._id,
        title: blog.title,
        createdAt: blog.createdAt,
        likesCount: blog.likes.length,
        commentsCount: blog.comments.length,
      })),
    })
  } catch (error) {
    console.error("Public profile fetch error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Follow a user
router.post("/follow/:clerkId", clerkAuth, async (req, res) => {
  try {
    if (req.params.clerkId === req.auth.userId) {
      return res.status(400).json({ error: "You cannot follow yourself" })
    }

    // Get the user to follow
    const userToFollow = await User.findOne({ clerkId: req.params.clerkId })

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get the current user
    let currentUser = await User.findOne({ clerkId: req.auth.userId })

    if (!currentUser) {
      // Create a new user record if it doesn't exist
      currentUser = new User({
        clerkId: req.auth.userId,
        email: req.body.email || req.auth.tokenPayload?.email || "unknown",
        username: req.body.username || req.auth.tokenPayload?.name || "user",
      })
    }

    // Check if already following
    if (currentUser.following.includes(req.params.clerkId)) {
      return res.status(400).json({ error: "Already following this user" })
    }

    // Update following and followers
    currentUser.following.push(req.params.clerkId)
    userToFollow.followers.push(req.auth.userId)

    await Promise.all([currentUser.save(), userToFollow.save()])

    res.status(200).json({
      message: "Successfully followed user",
      followingCount: currentUser.following.length,
    })
  } catch (error) {
    console.error("Follow user error:", error)
    res.status(500).json({ error: "Failed to follow user" })
  }
})

// Unfollow a user
router.post("/unfollow/:clerkId", clerkAuth, async (req, res) => {
  try {
    // Get the user to unfollow
    const userToUnfollow = await User.findOne({ clerkId: req.params.clerkId })

    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get the current user
    const currentUser = await User.findOne({ clerkId: req.auth.userId })

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if following
    if (!currentUser.following.includes(req.params.clerkId)) {
      return res.status(400).json({ error: "Not following this user" })
    }

    // Update following and followers
    currentUser.following = currentUser.following.filter((id) => id !== req.params.clerkId)
    userToUnfollow.followers = userToUnfollow.followers.filter((id) => id !== req.auth.userId)

    await Promise.all([currentUser.save(), userToUnfollow.save()])

    res.status(200).json({
      message: "Successfully unfollowed user",
      followingCount: currentUser.following.length,
    })
  } catch (error) {
    console.error("Unfollow user error:", error)
    res.status(500).json({ error: "Failed to unfollow user" })
  }
})

// Admin routes

// Get all users (admin only)
router.get("/", clerkAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Update user role (admin only)
router.put("/:userId/role", clerkAuth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body

    if (!["user", "author", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    user.role = role
    await user.save()

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update role error:", error)
    res.status(500).json({ error: "Failed to update user role" })
  }
})

module.exports = router

