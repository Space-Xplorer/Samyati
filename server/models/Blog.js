const mongoose = require("mongoose")

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true }, // Clerk user ID
    authorUsername: { type: String, default: "Unknown Author" }, // Store username for display
    image: {
      data: Buffer,
      contentType: String,
    },
    likes: [{ type: String }], // Store Clerk user IDs
    comments: [
      {
        text: String,
        author: { type: String }, // Clerk user ID
        authorUsername: { type: String, default: "Anonymous" }, // Store username for display
        createdAt: { type: Date, default: Date.now },
      },
    ],
    featured: { type: Boolean, default: false },
    categories: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true },
)

module.exports = mongoose.model("Blog", BlogSchema)

