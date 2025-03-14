const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Samyati", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  image: { data: Buffer, contentType: String }, 
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
