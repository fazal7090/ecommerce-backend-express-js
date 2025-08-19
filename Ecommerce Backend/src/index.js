import express from 'express';
import morganMiddleware from './config/morganMiddleware.js';
import seller_product_router from './routes/seller-routes/seller-product-routes.js';
import seller_order_router from './routes/seller-routes/seller-order-routes.js';
import admin_seller_router from './routes/admin-routes/admin-seller-routes.js';
import admin_product_router from './routes/admin-routes/admin-product-routes.js';
import user_auth_router from './routes/user-routes/user-auth-routes.js';

import { errorHandler } from './middleware/error-middleware.js';
import Logger from './lib/logger.js';
import router from './routes/seller-routes/seller-product-routes.js';

const app=express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Now all requests will be logged using Morgan
app.use(morganMiddleware);

// User Authentication Routes
app.use('/user', user_auth_router);

// Sellers Product routes
app.use('/seller', seller_product_router);
//Seller Order routes
app.use('/seller', seller_order_router);

// Admin Routes
app.use('/admin/seller', admin_seller_router);
app.use('/admin/seller/product', admin_product_router);


// Error handling middleware (MUST be last)
app.use(errorHandler);

app.listen(port, () => {
  Logger.info(`Server is running on http://localhost:${port}`);
});