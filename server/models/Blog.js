const mongoose = require("mongoose")

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true }, // Clerk user ID
    image: {
      data: Buffer,
      contentType: String,
    },
    likes: [{ type: String }], // Store Clerk user IDs
    comments: [
      {
        text: String,
        author: { type: String }, // Clerk user ID
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

