import express from 'express';
const router = express.Router();
import { uploads } from '../middleware/upload-middleware.js';
import { product_adder,update_product,delete_product,get_all_products,get_single_product } from '../controllers/product_controllers.js'
import { handleValidation } from '../middleware/error-middleware.js';
import { body } from 'express-validator';
import Logger from '../lib/logger.js';

function checkfile(req, res, next) {
  if (!req.file)
  {
    Logger.warn('Product update failed: No fields provided');
    return res.status(400).json({ message: 'Image file is required.' });
  }
  next();
}

function validateProductUpdate(req, res, next) {
  const { id, name, description, price, stock, imageUrl } = req.body;

  if (!id) {
    Logger.warn('Product update failed: No id provided');
    return res.status(400).json({ message: 'Product id is required.' });
  }

  if (
    name === undefined &&
    description === undefined &&
    price === undefined &&
    stock === undefined &&
    imageUrl === undefined
  ) {
    Logger.warn('Product update failed: No fields provided');
    return res.status(400).json({ message: 'At least one field to update must be provided.' });
  }

  next();
}

function validateDeleteProduct(req, res, next) {
  // Check for presence and non-empty value
  if (
    !req.body ||
    req.body.id === undefined ||
    req.body.id === null ||
    req.body.id === ''
  ) {
    Logger.warn('Product deletion failed: No id provided');
    return res.status(400).json({ message: 'Product id is required.' });
  }
  next();
}

router.post(
  '/addproduct',
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


  ],
  handleValidation,
  product_adder
)

router.patch(
  '/updateproduct',
  uploads.single('imageUrl'),
  validateProductUpdate,
  update_product
)


router.delete(
  '/deleteproduct',
  validateDeleteProduct,
  delete_product
)

router.get(
  '/getsingleproduct/:productid',
   get_single_product
)


router.get(
  '/getallproduct',
   get_all_products
)


export default router; 