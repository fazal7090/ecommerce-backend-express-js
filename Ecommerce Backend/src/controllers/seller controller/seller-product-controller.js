import { PrismaClient } from "@prisma/client";
import Logger from "../../lib/logger.js";
import { AppError } from "../../utils/AppError.js";
import { uploadBufferToCloudinary } from "../../lib/uploadToCloudinary.js";
import { getStorage } from "../../storage/index.js";

const prisma = new PrismaClient();

const storage = getStorage(); // Get the storage adapter (Cloudinary or others)
// it can be used to upload/delete and get URL of image

//Store creation function
export const create_store = async (req, res) => {
  const { storeName, storeDescription, ownerid } = req.body;

  const user = await prisma.User.findUnique({
    where: { id: ownerid },
  });

  if (!user || user.role !== "seller") {
    Logger.error(`Seller not found with id: ${ownerid}`);
    throw new AppError(404, "Seller not found");
  }

  const store_exsist = await prisma.Store.findUnique({
    where: { store_owner_id: ownerid },
  });

  if (store_exsist) {
    Logger.error(`Store already exists for owner id: ${ownerid}`);
    throw new AppError(409, "Store already exists");
  }

  const newstore = await prisma.Store.create({
    data: {
      name: storeName,
      description: storeDescription,
      store_owner_id: ownerid,
    },
  });

  Logger.info(`Store created successfully for owner ${ownerid}:`, newstore);
  return res.status(201).json({ message: "Store created", data: newstore });
};

//Product addition function
// This function allows sellers to add products to their store

export const add_product = async (req, res) => {
  let { name, description, price, stock, categoryid, storeid } = req.body;
  categoryid = parseInt(categoryid);
  storeid = parseInt(storeid);
  price = parseFloat(price);
  stock = parseInt(stock);

  // prevent duplicate
  const exists = await prisma.product.findFirst({
    where: { name, categoryid, storeid },
  });
  if (exists) throw new AppError(409, "Product already exists");

  // upload if provided
  let imageId = null,
    imageProv = process.env.MEDIA_PROVIDER;
  if (req.file?.buffer) {
    const uploaded = await storage.upload({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      folder: `products`,
    });
    imageId = uploaded.id; // provider-agnostic id (public_id or key)
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      categoryid,
      storeid,
      imageId,
      imageProv,
    },
  });

  Logger.info(`Product created`, { id: product.id, storeid });
  res.status(201).json({ message: "Product created", data: product });
};

// Product update function for price and stock
export const update_product = async (req, res) => {
  const { id } = req.params;
  const { price, stock } = req.body;

  // Ensure at least one field is provided
  if (price === undefined && stock === undefined) {
    Logger.error(`Product update failed: No fields provided for product ${id}`);
    throw new AppError(
      400,
      "At least one field (price or stock) must be provided for update"
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    Logger.error(`Product not found with id: ${id}`);
    throw new AppError(404, "Product not found");
  }

  // Build update data dynamically
  const updateData = {};
  if (price !== undefined) updateData.price = price;
  if (stock !== undefined) updateData.stock = stock;

  const updatedProduct = await prisma.product.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  Logger.info(`Product updated successfully: ${id}`, updatedProduct);
  return res.status(200).json({
    message: "Product updated",
    data: updatedProduct,
  });
};



// Delete product function
export const delete_product = async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    Logger.error(`Product not found with id: ${id}`);
    throw new AppError(404, "Product not found");
  }

  // Delete product from Cloudinary if image exists
  if (product.imageId) {
    const res = await storage.delete(product.imageId);

    if (res.result === "not found") {
      Logger.warn(`Image not found in Cloudinary: ${product.imageId}`);
      throw new AppError(404, "Image not found on Cloudinary");
    } else if (res.result !== "ok") {
      Logger.error(
        `Failed to delete image from Cloudinary: ${product.imageId}`
      );
      throw new AppError(500, "Failed to delete product image from Cloudinary");
    }
    // Log successful deletion
    Logger.info(`Image deleted from Cloudinary: ${product.imageId}`);
  }

  await prisma.product.delete({
    where: { id: parseInt(id) },
  });

  Logger.info(`Product deleted successfully: ${id}`);
  return res.status(200).json({ message: "Product deleted successfully" });
};

// ALL THE GET FUNCTIONS BELOW

// Get all categories in the platform
export const get_all_categories = async (req, res) => {
  const categories = await prisma.category.findMany(); // no WHERE filter

  Logger.info(`Fetched all categories`, { count: categories.length });

  return res.status(200).json({
    message: "Categories fetched successfully",
    data: categories,
  });
};

// Get all products in a specific category of a store
export const get_products_by_category = async (req, res) => {
  const { storeid, categoryid } = req.params;

  const store = await prisma.Store.findUnique({
    where: { id: parseInt(storeid) } ,
    include:{
      product :{
        where: { categoryid: parseInt(categoryid) }
      }
    }
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeid}`);
    throw new AppError(404, "Store not found");
  }
  const products = store.product;
  // If no products found in the category, return an empty array with a message
  if (!products || products.length === 0) {
    Logger.warn(
      `No products found for store ${storeid} in category ${categoryid}`
    );
    return res.status(404).json({
      message: "No products found for this category in the store",
      data: [],
    });
  }

  Logger.info(
    `Fetched products for store ${storeid} in category ${categoryid}`,
    { count: products.length }
  );
  return res
    .status(200)
    .json({ message: "Products fetched successfully", data: products });
};

// Get all products in a store
export const get_all_products = async (req, res) => {
  const { storeid } = req.params;
  const page  = Math.max(1, parseInt(req.query.page ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? "20")));
  const skip  = (page - 1) * limit;

  const store = await prisma.Store.findUnique({
    where: { id: parseInt(storeid) },
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeid}`);
    throw new AppError(404, "Store not found");
  } 

  const rows = await prisma.product.findMany({
    where: { storeid: parseInt(storeid) },
    skip,
    take: limit + 1,             // fetch one extra
    orderBy: { createdAt: "desc" } // keep ordering stable
  });

  const hasNext = rows.length > limit;
  const data = hasNext ? rows.slice(0, limit) : rows;

  res.json({
    page,
    limit,
    hasPrev: page > 1,
    hasNext,
    data
  });
};


//GET HOW MANY PRODUCTS BELONGS TO EACH CATEGORY IN A STORE + TOTAL PRODUCTS IN A STORE
export const total_products_by_category = async (req, res) => {
  const { storeid } = req.params;

  // Check if store of storeid provided exists
  const store = await prisma.Store.findUnique({
    where: { id: parseInt(storeid) },
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeid}`);
    throw new AppError(404, "Store not found");
  }

  const totalProducts = await prisma.product.count({
    where: { storeid: parseInt(storeid) },
  });

  // we cant use groutby with include in prisma
  const cat_groups = await prisma.product.groupBy({
    by: ["categoryid"],
    _count: {
      id: true,
    },
    where: { storeid: parseInt(storeid) },
  });

  const productsByCategory = cat_groups.map((group) => ({
    categoryid: group.categoryid,
    totalProducts: group._count.id,
  }));

  // Fetch categories for the categories in productsByCategory so that we can get category names
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: productsByCategory.map((cat) => cat.categoryid),
      },
    },
  });

  const response = productsByCategory.map((cat) => {
    //Looping over each category to find the name for over catid
    const catname =
      categories.find((c) => c.id === cat.categoryid)?.name ||
      "Unknown Category";

    return {
      categoryid: cat.categoryid,
      totalProducts: cat.totalProducts,
      categoryName: catname,
    };
  });

  Logger.info(`Products by category fetched for store ${storeid}:`, {
    productsByCategory: response,
    totalProducts: totalProducts,
  });

  return res.status(200).json({
    message: "Products by category fetched successfully",
    data: {
      productsByCategory: response,
      totalProducts: totalProducts,
    },
  });
};

// Get a single product by ID along with its imageURL
export const get_product_by_id = async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    Logger.error(`Product not found with id: ${id}`);
    throw new AppError(404, "Product not found");
  }

  // Get the image URL if it exists
  let imageUrl = null;
  if (product.imageId) {
    imageUrl = await storage.getUrl(product.imageId);
  }

  Logger.info(`Fetched product by ID: ${id}`, { product });
  return res.status(200).json({
    message: "Product fetched successfully",
    data: { ...product, imageUrl },
  });
};