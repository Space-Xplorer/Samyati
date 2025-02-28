const { verifyToken } = require('@clerk/backend');

const clerkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = await verifyToken(token);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = clerkAuth;