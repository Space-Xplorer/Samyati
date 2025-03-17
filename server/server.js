require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
// Fix CORS to allow requests from any localhost port
app.use(
  cors({
    // Allow any localhost port for development
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true)

      // Allow all localhost origins regardless of port
      if (origin.startsWith("http://localhost:")) {
        return callback(null, true)
      }

      callback(new Error("Not allowed by CORS"))
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

// For preflight requests
app.options("*", cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err)
    process.exit(1)
  })

// Routes
app.get("/", (req, res) => {
  res.send("Samyati API is running")
})

// Import routes
const blogRoutes = require("./routes/blogRoutes")
const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")

// Use routes
app.use("/api/blogs", blogRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Server error",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

