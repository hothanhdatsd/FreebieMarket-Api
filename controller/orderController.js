import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

//POST one order
// POST /api/orders
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice, //
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

//GET order by ID
//GET /api/orders/:id
const getOrderByID = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//GET update order to paid
//GET /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

//GET user order
//GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  });
  res.json(orders);
});

//ADMIN
//GET  orders
//GET /api/orders/myorders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "id name");
  res.json(orders);
});

//thong ke loi nhuan don hang
const totalOrders = asyncHandler(async (req, res) => {
  const date = new Date();
  const thisMonth = date.getMonth() + 1;

  const orders = await Order.find({
    $expr: {
      $and: [{ $eq: [{ $month: "$createdAt" }, thisMonth] }],
    },
  });
  console.log(orders);
  res.send("OK");
});

const calculateTotalRevenueByDay = asyncHandler(async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          isPaid: true, // Chỉ lấy ra các đơn hàng đã thanh toán
        },
      },
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            productId: "$orderItems.product",
          },
          totalRevenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } },
        },
      },
    ]);

    const revenueByDay = {};

    result.forEach((item) => {
      const day = item._id.day;
      const productId = item._id.productId;
      const totalRevenue = item.totalRevenue;

      if (!revenueByDay[day]) {
        revenueByDay[day] = [];
      }

      revenueByDay[day].push({ productId, totalRevenue });
    });

    return res.status(200).json({ success: true, data: revenueByDay });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const calculateTotalRevenueByMonth = asyncHandler(async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          isPaid: true, // Chỉ lấy ra các đơn hàng đã thanh toán
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: { $multiply: ["$totalPrice", 1] } },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export {
  updateOrderToPaid,
  updateOrderToDelivered,
  addOrderItems,
  getOrderByID,
  getMyOrders,
  getOrders,
  totalOrders,
  calculateTotalRevenueByDay,
  calculateTotalRevenueByMonth
};
