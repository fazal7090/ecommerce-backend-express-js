import { PrismaClient } from "@prisma/client";
import Logger from "../../lib/logger.js";
import { AppError } from "../../utils/AppError.js";


const prisma = new PrismaClient();

// Total Order Revenue
export const total_revenue = async (req, res) => {
  const { storeid } = req.params;

    const store = await prisma.Store.findUnique({
    where: { id: parseInt(storeid) },
    include: {
      orders: {
        where: {
          status: { not: 'cancelled' } // exclude cancelled
        }
      },
    },
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeid}`);
    throw new AppError(404, "Store not found");
  }

  const totalRevenue = store.orders.reduce((acc, order) => {
    return acc + order.totalAmount;
  }, 0);

  Logger.info(`Total revenue fetched for store ${storeid}: ${totalRevenue}`);
  return res
    .status(200)
    .json({ message: "Total revenue fetched", data: totalRevenue });
};

// Total Pending Orders
export const total_pending_orders = async (req, res) => {
  const { storeid } = req.params;

  const store = await prisma.Store.findUnique({
    where: { id: parseInt(storeid) },
    include: {
      orders: true, // Include orders related to the store
    },
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeid}`);
    throw new AppError(404, "Store not found");
  }

  const pendingOrdersCount = store.orders.filter(
    (order) => order.status === "pending"
  );
  const totalPendingOrders = pendingOrdersCount.length;

  Logger.info(`Total pending orders fetched for store ${storeid}: ${totalPendingOrders}`);
  return res.status(200).json({
    message: "Total pending orders fetched",
    data: totalPendingOrders,
  });
};

// Total Product Count in Orders in a specific category in a store
export const total_product_count_in_orders = async (req, res) => {
  const { storeid } = req.params;
  const { categoryid } = req.params;

  const category = await prisma.Category.findUnique({
    where: { id: parseInt(categoryid) },
  });
  if (!category) {
    Logger.error(`Category not found with id: ${categoryid}`);
    throw new AppError(404, "Category not found");
  }

  const store = await prisma.store.findUnique({
    where: { id: parseInt(storeid) },
    include: {
      orders: {
        include: {
          orderItems: {
            where: {
              product: {
                categoryid: parseInt(categoryid),
              },
            },
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!store) {
    Logger.error(`Store not found with id: ${storeid}`);
    throw new AppError(404, "Store not found");
  }

  const allorders = store.orders.flatMap((order) => order.orderItems);

  const proid_and_count_array = allorders.reduce((acc, orderItem) => {
    if (!acc[orderItem.productId]) {
      acc[orderItem.productId] = [];
    }
    acc[orderItem.productId].push(orderItem.quantity, orderItem.product.name);
    return acc;
  }, {});

  const result = Object.entries(proid_and_count_array).map(
    ([productId, arr]) => {
      // sum only the quantities (even indexes)
      const totalQuantity = arr
        .filter((_, index) => index % 2 === 0) // pick quantities
        .reduce((sum, qty) => sum + qty, 0);

      // product name will be same for all, so take first odd index
      const productName =
        arr.find((_, index) => index % 2 === 1) || "Unknown";

      return {
        productId,
        productName,
        totalQuantity,
      };
    }
  );

  Logger.info(`Total product count in orders fetched for store ${storeid}, category ${categoryid}:`, result);

  return res.status(200).json({
    message: "Total product count in orders fetched successfully",
    data: result,
  });
};
