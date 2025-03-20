const jwt = require("jsonwebtoken")

const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing" })
    }

    const token = authHeader.split(" ")[1]

    try {
      const decoded = jwt.decode(token)

      if (!decoded || !decoded.sub) {
        throw new Error("Invalid token structure")
      }

      console.log("Token decoded for user:", decoded.sub)

      req.auth = {
        userId: decoded.sub,
        sessionId: decoded.sid || "unknown",
        tokenPayload: decoded,
      }

      next()
    } catch (error) {
      console.error("Token decode error:", error.message)
      res.status(401).json({
        message: "Invalid token",
        error: error.message,
      })
    }
  } catch (err) {
    console.error("Auth middleware error:", err.message)
    res.status(401).json({
      message: "Authentication failed",
      error: err.message,
    })
  }
}

module.exports = clerkAuth

