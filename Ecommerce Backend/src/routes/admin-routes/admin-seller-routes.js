import { Router } from "express";
import { all_sellers,all_products_of_seller } from "../../controllers/admin controller/admin-seller-controller.js";
import { param } from "express-validator";


const router = Router();

// Get all sellers
router.get("/all-sellers",
    all_sellers)
   
export default router;    