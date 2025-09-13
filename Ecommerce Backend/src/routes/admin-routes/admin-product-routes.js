import Logger from "../../lib/logger.js";
import { Router } from "express";
import {
  add_product,
  update_product,
  total_products_by_category,
  delete_product,
  get_all_products,
  get_products_by_category,
  get_all_categories,
} from "../../controllers/seller controller/seller-product-controller.js";
import { uploads } from "../../middleware/upload-middleware.js";
import { handleValidation } from "../../middleware/error-middleware.js";
import { body, param } from "express-validator";
import { authMiddleware } from "../../middleware/authmiddleware.js";

const router = Router();

function checkfile(req, res, next) {
  if (!req.file) {
    Logger.warn("Product addition failed: No image file provided");
    return res.status(400).json({ message: "Image file is required." });
  }
  next();
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
};

// Add Product to Store
router.post(
  "/add-product",
  uploads.single("imageUrl"), //req.body is populated by Multer before express-validator runs
  //since we are sending image in form-data, we need to use multer middleware
  checkfile,
  [
    body("name")
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isString()
      .withMessage("Name must be a string"),

    body("description")
      .notEmpty()
      .withMessage("Description cannot be empty")
      .isString()
      .withMessage("Description must be a string"),

    body("price")
      .notEmpty()
      .withMessage("Price cannot be empty")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a number greater than 0"),

    body("stock")
      .notEmpty()
      .withMessage("Stock cannot be empty")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("categoryid")
      .notEmpty()
      .withMessage("Category Id cannot be empty")
      .isInt({ min: 0 })
      .withMessage("Categoryid must be a non-negative integer"),

    body("storeid")
      .notEmpty()
      .withMessage("Store Id cannot be empty")
      .isInt({ min: 0 })
      .withMessage("Storeid must be a non-negative integer"),
  ],
  handleValidation,
  authMiddleware,
  requireAdmin,
  add_product
);

// Delete Product
router.delete(
  "/delete-product/:id",
  [param("id").isInt().withMessage("Product ID must be an integer")],
  authMiddleware,
  requireAdmin,
  delete_product
);

// Update Product Price or Stock
router.put(
  "/update-product/:id",
  [
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a number greater than 0"),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
  ],
  handleValidation,
  authMiddleware,
  requireAdmin,
  update_product
);

//Get all products in a store
router.get(
  "/get-all-products/:storeid",
  [param("storeid").isInt().withMessage("Store ID must be an integer")],
  authMiddleware,
  requireAdmin,
  get_all_products
);

// // ALL GET ROUTES

// //Get total products in a store , also total products in each category
// router.get(
//   "/get-products/:storeid",
//   [param("storeid").isInt().withMessage("Store ID must be an integer")],
//   total_products_by_category
// );

// // Get all categories in a store
// router.get(
//   "/get-all-categories",
//   get_all_categories
// );

// // Get products by category in a store
// router.get(
//   "/get-products-by-category/:storeid/:categoryid",
//   [
//     param("storeid").isInt().withMessage("Store ID must be an integer"),
//     param("categoryid").isInt().withMessage("Category ID must be an integer"),
//   ],
//   get_products_by_category
// );

// export default router;
export default router;
