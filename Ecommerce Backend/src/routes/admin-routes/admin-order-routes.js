import Logger from "../../lib/logger.js";
import { Router } from "express";
import { handleValidation } from '../../middleware/error-middleware.js';
import { body,param } from 'express-validator'
import { authMiddleware } from "../../middleware/authmiddleware.js";

import {total_revenue , total_pending_orders , total_product_count_in_orders } from "../../controllers/seller controller/seller-order-controller.js";

const router = Router();

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
  };

// Total Revenue for Store
router.get('/total-revenue/:storeid',
    [
        param('storeid')
        .notEmpty().withMessage('Store ID cannot be empty')
        .isInt({ gt: 0 }).withMessage('Store ID must be a positive integer'),
    ],
    handleValidation,
    authMiddleware,
    requireAdmin,
    total_revenue
    );

// Total Pending Orders for Store
router.get('/total-pending-orders/:storeid',
    [
        param('storeid')
        .notEmpty().withMessage('Store ID cannot be empty')
        .isInt({ gt: 0 }).withMessage('Store ID must be a positive integer'),
    ],
    handleValidation,
    authMiddleware,
    requireAdmin,
    total_pending_orders)


// Order count of all products in a category in a store 
router.get(
  '/total-product-count-in-orders/:storeid/:categoryid',
  [
    param('storeid')
      .notEmpty().withMessage('Store ID cannot be empty')
      .isInt({ gt: 0 }).withMessage('Store ID must be a positive integer'),
    param('categoryid')
      .notEmpty().withMessage('Category ID cannot be empty')
      .isInt({ gt: 0 }).withMessage('Category ID must be a positive integer'),
  ],
  handleValidation,
  authMiddleware,
    requireAdmin,
  total_product_count_in_orders
);

export default router;