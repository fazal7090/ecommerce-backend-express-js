import express from 'express';
import product_routes from "./routes/product_routes.js"
import morganMiddleware from './config/morganMiddleware.js';
import seller_product_router from './routes/seller-routes/seller-product-routes.js';
import seller_order_router from './routes/seller-routes/seller-order-routes.js';
import { errorHandler } from './middleware/error-middleware.js';

const app=express();
const port = 3000;

app.use(express.json());

// Now all requests will be logged using Morgan
app.use(morganMiddleware);

// Sellers Product routes
app.use('/seller', seller_product_router);
//Seller Order routes
app.use('/seller', seller_order_router);


// Product routes
app.use('/product',product_routes)

// Error handling middleware (MUST be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});