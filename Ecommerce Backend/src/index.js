import express from 'express';
import product_routes from "./routes/product_routes.js"
import Logger from "./lib/logger.js";
import morganMiddleware from './config/morganMiddleware.js';
import seller_router from './routes/seller_routes.js';
const app=express();
const port = 3000;

app.use(express.json());

// Now all requests will be logged using Morgan
app.use(morganMiddleware);

// Sellers routes
app.use('/seller', seller_router);
// Product routes
app.use('/product',product_routes)



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});