import { PrismaClient } from "@prisma/client";
import Logger from "../../lib/logger.js";
import { AppError } from "../../utils/AppError.js";


const prisma = new PrismaClient();

export const all_sellers = async (req, res) => {
  const sellers = await prisma.User.findMany({
    where: { role: "seller" },
    select: {
      id: true,
      name: true,
      email: true,
      store: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!sellers || sellers.length === 0) {
    Logger.error("No sellers found");
    throw new AppError(404, "No sellers found");
  }

  Logger.info("Fetched all sellers successfully");
  return res.status(200).json({ message: "Sellers fetched successfully", data: sellers });
}

export const all_products_of_seller = async (req, res) => {
  const { storeid } = req.params;

  const products = await prisma.Product.findMany({
    where: { storeid : parseInt(storeid) },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      categoryid: true,
    },
  });

  if (!products || products.length === 0) {
    Logger.error(`No products found for seller with ID ${storeid}`);
    throw new AppError(404, `No products found for seller with ID ${storeid}`);
  }

  Logger.info(`Fetched all products for seller with ID ${storeid} successfully`);
  return res.status(200).json({ message: "Products fetched successfully", data: products });
}