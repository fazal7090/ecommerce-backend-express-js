import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

const generateTokenAndRespond = (req, res) => {
  if (!req.user) {
    return res.status(500).json({ message: 'User info missing for token generation' });
  }
  const JWT_SECRET = process.env.JWT_SECRET ;
  const token = jwt.sign(
    { userId: req.user.id, email: req.user.email , role :req.user.role },
    JWT_SECRET
  );
  res.json({
    message: 'Login successful',
    token,
    data: { email: req.user.email }
    
  });
};



export {generateTokenAndRespond}