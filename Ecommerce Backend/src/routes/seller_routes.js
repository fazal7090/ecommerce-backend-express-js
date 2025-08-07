import Logger from "../lib/logger.js";
import { Router } from "express";
import {create_store,add_product,update_product,total_products_overall, total_products_by_category} from "../controllers/seller-controller.js";
import { uploads } from '../middleware/upload-middleware.js';
import { handleValidation } from '../middleware/error-middleware.js';
import { body,param } from 'express-validator';

const router = Router();

function checkfile(req, res, next) {
  if (!req.file)
  {
    Logger.warn('Product addition failed: No image file provided');
    return res.status(400).json({ message: 'Image file is required.' });
  }
  next();
}

// Create Store
router.post('/create-store',
     [
  body('storeName')
    .notEmpty().withMessage('Store name cannot be empty')
    .isString().withMessage('Store name must be a string'),

  body('storeDescription')
    .notEmpty().withMessage('Store description cannot be empty')
    .isString().withMessage('Store description must be a string'),

  body('ownerid')
    .notEmpty().withMessage('Owner ID cannot be empty')
    .isString().withMessage('Owner ID must be a string')
    .isUUID().withMessage('Owner ID must be a valid UUID'), // optional, for stricter validation
],
     handleValidation,
     create_store
    );

// Add Product to Store
router.post(
  '/add-product',
    uploads.single('imageUrl'), //req.body is populated by Multer before express-validator runs
    //since we are sending image in form-data, we need to use multer middleware
    checkfile,
  [
    body('name')
      .notEmpty().withMessage('Name cannot be empty')
      .isString().withMessage('Name must be a string'),

    body('description')
      .notEmpty().withMessage('Description cannot be empty')
      .isString().withMessage('Description must be a string'),

    body('price')
      .notEmpty().withMessage('Price cannot be empty')
      .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),

    body('stock')
      .notEmpty().withMessage('Stock cannot be empty')
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

    body('categoryid')
      .notEmpty().withMessage('Category Id cannot be empty')
      .isInt({ min: 0 }).withMessage('Categoryid must be a non-negative integer'),

       body('storeid')
      .notEmpty().withMessage('Store Id cannot be empty')
      .isInt({ min: 0 }).withMessage('Storeid must be a non-negative integer'),


  ],
  handleValidation,
  add_product
)
export default router;

// Update Product Price or Stock
router.put(
  '/update-product/:id',
  [
    body('price')
      .optional()
      .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),

    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ],
  handleValidation,
  update_product
);

//Get total products in a store
router.get('/get-products/:storeid', 
   [
    param('storeid').isInt().withMessage('Store ID must be an integer')
  ],
  total_products_overall);

  
// Get total products in a store by categories
router.get('/get-products-by-category/:storeid', 
   [
    param('storeid').isInt().withMessage('Store ID must be an integer')
  ],
  total_products_by_category);
