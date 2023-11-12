import express from "express";
import {
  addOrderItems,
  calculateTotalRevenueByDay,
  calculateTotalRevenueByMonth,
  getMyOrders,
  getOrderByID,
  getOrders,
  totalOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  getTotalOrdersCompletedByDay,
} from "../controller/orderController.js";
import {admin, protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);
router.route("/chart").get(protect, admin, totalOrders);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:id").get(protect, getOrderByID);
router.route("/:id/pay").put(protect, updateOrderToPaid);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);
router.get("/chart/revenue", calculateTotalRevenueByDay)
router.get("/chart/profit", calculateTotalRevenueByMonth)
router.get("/chart/total_orders_completed", getTotalOrdersCompletedByDay)

export default router;
