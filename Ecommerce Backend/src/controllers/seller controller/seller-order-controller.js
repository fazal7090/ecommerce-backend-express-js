import { PrismaClient } from "@prisma/client";
import Logger from "../../lib/logger.js";
import { AppError } from "../../utils/AppError.js";


const prisma = new PrismaClient();

// Total Order Revenue
export const total_revenue = async (req, res) => {
  const storeIdNum = parseInt(req.params.storeid, 10);
 
  // Check if store exists
  const storeExists = await prisma.store.findUnique({
    where: { id: storeIdNum },
    select: { id: true },
  });
  if (!storeExists) {
    Logger.error(`Store not found with id: ${storeIdNum}`);
    throw new AppError(404, "Store not found");
  }

  // Sum in DB
  const EXCLUDED_STATUSES = ['cancelled']; // add 'refunded' if needed
  const result = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      storeId: storeIdNum,
      status: { notIn: EXCLUDED_STATUSES },
    },
  });

  // Prisma returns Decimal | number | null depending on your schema/client config
  const sum = result._sum.totalAmount ?? 0;

  Logger.info(`Total revenue fetched for store ${storeIdNum}: ${sum}`);
  return res.status(200).json({
    message: "Total revenue fetched",
    data: sum,
  });
};

// Total Pending Orders
export const total_pending_orders = async (req, res) => {
  const storeId = Number.parseInt(req.params.storeid, 10);

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeId}`);
    throw new AppError(404, "Store not found");
  }

  const totalPendingOrders = await prisma.order.count({
    where: {
      storeId,
      status: "pending",
    },
  });

  Logger.info(`Total pending orders fetched for store ${storeId}: ${totalPendingOrders}`);
  return res.status(200).json({
    message: "Total pending orders fetched",
    data: totalPendingOrders,
  });
};


// Total Product Count in Orders in a specific category in a store
export const total_product_count_in_orders = async (req, res) => {
  const { storeid } = req.params;
  const { categoryid } = req.params;
  
  const grouped = await prisma.orderItem.groupBy({
  by: ["productId"],
  where: {
    order: { storeId: parseInt(storeid) },
    product: { categoryid: parseInt(categoryid) },
  },
  _sum: { quantity: true },
});
    
const productIds = grouped.map(g => g.productId);

const products = await prisma.product.findMany({
  where: { id: { in: productIds } },
  select: { id: true, name: true },
});

const productMap = Object.fromEntries(
  products.map(p => [p.id, p.name])
);

const result = grouped.map(g => ({
  productId: g.productId,
  quantity: g._sum.quantity,
  productName: productMap[g.productId] || "Unknown Product",
}));

Logger.info(`Total product count in orders for store ${storeid} and category ${categoryid} fetched`);
  return res.status(200).json({
    message: "Total product count in orders fetched",
    data: result,
  });
};