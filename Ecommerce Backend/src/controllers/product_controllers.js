import { PrismaClient } from '@prisma/client';  // if using ES module
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();

// Add product
export const product_adder = async (req, res) => {
    try {
      const { name, description, price, stock } = req.body;
  
      // Multer adds `req.file` when using `upload.single('image')`
      const imageUrl = req.file ? req.file.path : null;
  
      // Check if product with the same name already exists
      const prod_already_exists = await prisma.product.findFirst({
        where: { name },
      });
  
      if (prod_already_exists) {
        return res.status(409).json({ message: 'Product already exists', data: null });
      }
  
      const newProduct = await prisma.product.create({
        data: { name, description, price: parseFloat(price), stock: parseInt(stock), imageUrl },
      });
  
      return res.status(201).json({ message: 'Product created', data: newProduct });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Update Product 
  export const update_product = async (req, res) => {
    try {
      const { id, name, description, price, stock } = req.body;
  
      // Check if product exists
      const product = await prisma.product.findUnique({ where: { id: Number(id) } });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      let data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = parseFloat(price);
      if (stock !== undefined) data.stock = parseInt(stock);
  
      
      if (req.file) {
        
          // Normalize the path for the current OS
          const oldImagePath = path.join(process.cwd(), ...product.imageUrl.split(/[\\/]/));
      
          console.log('Attempting to delete:', oldImagePath);
      
          if (fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => {
              if (err) {
                console.error('Failed to delete old image:', err.message);
              } else {
                console.log('Old image deleted:', oldImagePath);
              }
            });
          } else {
            console.warn('Old image file does not exist:', oldImagePath);
          }
        
        data.imageUrl = req.file.path;
      }
      
  
      const updatedProduct = await prisma.product.update({
        where: { id: Number(id) },
        data
      });
  
      return res.status(200).json({ message: 'Product updated', data: updatedProduct });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// Delete product
export const delete_product = async (req, res) => {
  try {
    const { id } = req.body;
   
    // Find the product
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Delete the image file if it exists
  if (product.imageUrl) {
  let imagePath;

  if (path.isAbsolute(product.imageUrl)) {
    imagePath = product.imageUrl;
  } else {
    imagePath = path.join(process.cwd(), ...product.imageUrl.split(/[\\/]/));
  }

  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Failed to delete product image:', err.message);
      } else {
        console.log('Product image deleted:', imagePath);
      }
    });
  }
}

    // Delete the product from the database
    await prisma.product.delete({ where: { id: Number(id) } });
    return res.status(200).json({ message: 'Product deleted successfully.' });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product by id
export const get_single_product = async (req, res) => {
  try {
    const { productid } = req.params;
    if (!productid) {
      return res.status(400).json({ message: 'Product id is required in params.' });
    }
    const numericId = Number(productid);
    if (isNaN(numericId)) {
      return res.status(400).json({ message: 'Product id must be a number.' });
    }
    const product = await prisma.product.findUnique({ where: { id: numericId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.status(200).json({ message: 'Product fetched successfully.', data: product });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all products
export const get_all_products = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json({ message: 'Products fetched successfully.', data: products });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


