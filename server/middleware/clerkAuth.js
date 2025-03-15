const { verifyToken } = require('@clerk/backend');
const { createClerkClient } = require('@clerk/backend');

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  jwksUri: process.env.CLERK_JWKS_URL,
  issuer: process.env.CLERK_ISSUER
});


const clerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await clerk.verifyToken(token, {
      authorizedParties: ['http://localhost:5173'], 
      issuer: process.env.CLERK_ISSUER
    });

    console.log('Token verified for user:', decoded.sub);
    
    req.auth = { 
      userId: decoded.sub,
      sessionId: decoded.sid,
      tokenPayload: decoded
    };
    
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ 
      message: 'Invalid token',
      error: err.message 
    });
  }
};

module.exports = clerkAuth;