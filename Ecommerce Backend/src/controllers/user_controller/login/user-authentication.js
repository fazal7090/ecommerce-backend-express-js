import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Logger from '../../../lib/logger.js'; // Assuming you have a logger utility


const prisma = new PrismaClient();

export const signup = async (req, res) => {

  const { name, email , password , role , contact , address } = req.body;
  
    const existingUser = await prisma.User.findUnique({ where: { email } });
    if (existingUser) {
      Logger.warn(`Signup attempt with existing email: ${email}`);
      res.status(409);
      return res.json({ message: "User already exists", data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        contact,
        address
      },
    });
    res.status(201).json({
      message: "User created successfully",
      data: { name, address, email,role }
    });

  } 
    
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  
    const user = await prisma.User.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User does not exist', data: null });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      Logger.warn(`Login attempt with invalid password for email: ${email}`);
    }
 
    // Attach user info to req for the middleware
    req.user = { id: user.id, email: user.email , role: user.role };
    next(); // Pass control to the JWT middleware
 

};