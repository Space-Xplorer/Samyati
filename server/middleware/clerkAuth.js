const { verifyToken } = require('@clerk/backend');

const clerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);
    req.auth = { userId: decoded.sub }; // Clerk's user ID
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = clerkAuth;