const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Samyati", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }, // Clerk user ID
  image: { data: Buffer, contentType: String },
  likes: [{ type: String }], // Store Clerk user IDs
  comments: [{
    text: String,
    author: { type: String }, // Clerk user ID
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
