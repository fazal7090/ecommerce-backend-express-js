import { PrismaClient } from "@prisma/client";
import Logger from "../lib/logger.js";
import { join } from "path";
const prisma = new PrismaClient();

//Store creation function
export const create_store = async (req, res) => {
  const { storeName, storeDescription, ownerid } = req.body;

  try {
    const user = await prisma.User.findUnique({
      where: { id: ownerid },
    });

    if (!user || user.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" , data: null});
    }

    const store_exsist = await prisma.Store.findUnique({
      where: { store_owner_id: ownerid },
    });

    if (store_exsist) {
      return res
        .status(409)
        .json({ message: "Store already exists", data: null });
    }

    const newstore = await prisma.Store.create({
      data: {
        name: storeName,
        description: storeDescription,
        store_owner_id: ownerid,
      },
    });

    return res.status(201).json({ message: "Store created", data: newstore });
  } catch (error) {
    Logger.error("Error creating store:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Product addition function
export const add_product = async (req, res) => {
    let {name, description, price, stock, categoryid , storeid } = req.body;
    categoryid = parseInt(categoryid); // Ensure categoryid is an integer
    storeid = parseInt(storeid); // Ensure storeid is an integer
    price = parseFloat(price); // Ensure price is a float
    stock = parseInt(stock); // Ensure stock is an integer
        try {
          // Multer adds `req.file` when using `upload.single('image')`
          const imageUrl = req.file ? req.file.path : null;
      
          // Check if product with the same name already exists
          const prod_already_exists = await prisma.product.findFirst({
            where: { name ,categoryid, storeid },
          });
      
          if (prod_already_exists) {
            return res.status(409).json({ message: 'Product already exists', data: null });
          }
      
          const newProduct = await prisma.product.create({
            data: { name, description,price, stock, categoryid , storeid, imageUrl },
          });
      
          return res.status(201).json({ message: 'Product created', data: newProduct });
        } catch (error) {
          return res.status(500).json({ message: 'Server error', error: error.message });
        }
      };

//Product update function for price and stock
export const update_product = async (req, res) => {
    const { id } = req.params;
    const { price, stock } = req.body;

    if (!price && !stock) {
        return res.status(400).json({ message: "At least one field (price or stock) must be provided for update", data: null });
    }
 
    try {
        const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        });
 
        if (!product) {
         price=product.price;
        }
        if (!stock)
         stock=product.stock;
    
        if (!product) {
        return res.status(404).json({ message: "Product not found", data: null });
        }
    
        const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { price, stock },
        });
    
        return res.status(200).json({ message: "Product updated", data: updatedProduct });
    } catch (error) {
        Logger.error("Error updating product:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
    }

// Total Products Overall for a specific seller
export const total_products_overall = async (req, res) => {
  const { storeid } = req.params;
if (!storeid) {
    Logger.warn('Total products fetch failed: No store ID provided');
    return res.status(400).json({ message: 'Store ID is required.' });
}
  try {
    const totalProducts = await prisma.product.count({
      where: { storeid: parseInt(storeid) },})

    const totalstock =await prisma.product.aggregate({
      _sum: {
        stock: true,
      },
      where: { storeid: parseInt(storeid) },    
    });

return res.status(200).json({
  message: "Summary fetched successfully",
  data: {
    totalProducts,
    totalstock,
  }
});
    
  } catch (error) {
    Logger.error("Error fetching total products:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//HOW MANY PRODUCTS BELONGS TO EACH CATEGORY IN A STORE
export const total_products_by_category = async (req, res) => {
    const { storeid } = req.params;
    
    try {

     // Check if store of storeid provided exists
        const store = await prisma.Store.findUnique({
            where: { id: parseInt(storeid) },
        });

        if (!store) {
            Logger.warn('Total products by category fetch failed: Store not found');
            return res.status(404).json({ message: 'Store not found.' });
        }

        const cat_groups = await prisma.product.groupBy({
        by: ['categoryid'],
        _count: {
            id: true,
        },
        where: { storeid: parseInt(storeid) } 
        });

        const productsByCategory = cat_groups.map(group => ({
            categoryid: group.categoryid,
            totalProducts: group._count.id,
        }));


       // Fetch categories for the categories in productsByCategory so that we can get category names
        const categories = await prisma.category.findMany({
          where :{
            id :{
              in : productsByCategory.map(cat => cat.categoryid)
            }
          }
        })

        
        const response = productsByCategory.map(cat => {
          //Looping over each category to find the name for over catid
           const catname = categories.find (c => c.id === cat.categoryid)?.name || "Unknown Category";

           return {
            categoryid: cat.categoryid,
            totalProducts: cat.totalProducts,
            categoryName: catname
           };
        });

        return res.status(200).json({
        message: "Products by category fetched successfully",
        data: response,
        });
        
    } catch (error) {
        Logger.error("Error fetching products by category:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
} 
