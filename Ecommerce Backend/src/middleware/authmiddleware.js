import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
export const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }
    
    const token = authHeader.split(' ')[1];
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      // Attach user info to request object
      req.user = { userId: decoded.userId, email: decoded.email , role:decoded.role};
      next();
    } catch (err) {
        console.log("err: %o", err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };