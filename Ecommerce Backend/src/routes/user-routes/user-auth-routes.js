import Logger from "../../lib/logger.js";
import { Router } from "express";
import { handleValidation } from '../../middleware/error-middleware.js';
import { body,param } from 'express-validator'
import { signup, login } from "../../controllers/user_controller/login/user-authentication.js";
import { generateTokenAndRespond } from '../../middleware/user-middleware.js';

const router = Router();

// User Signup Route
router.post('/signup',
    [
        body('name')
            .notEmpty().withMessage('Name cannot be empty'),
        body('email')
            .isEmail().withMessage('Invalid email format'),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
         body('role')
      .isIn(['user', 'seller']).withMessage('Role must be either user or seller'),
        body('contact')
            .notEmpty().withMessage('Contact cannot be empty'),
        body('address')
            .notEmpty().withMessage('Address cannot be empty'),
    ],
    handleValidation,
    signup
);

// User Login Route
router.post('/login',
    [
        body('email')
            .isEmail().withMessage('Invalid email format'),
        body('password')
            .notEmpty().withMessage('Password cannot be empty'),
    ],
    handleValidation,
    login,
    generateTokenAndRespond,
);

export default router;