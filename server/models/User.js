const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "author", "admin"],
      default: "user",
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    socialLinks: {
      twitter: String,
      instagram: String,
      facebook: String,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    following: [
      {
        type: String, // Clerk IDs of users being followed
      },
    ],
    followers: [
      {
        type: String, // Clerk IDs of followers
      },
    ],
  },
  { timestamps: true },
)

module.exports = mongoose.model("User", UserSchema)

