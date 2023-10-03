import express from "express";
import Discount from "../models/discountModel.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  getDiscount,
  createDiscount,
  deleteDiscount,
  getDetailDiscount,
  updatedDiscount,
  applyDiscount,
} from "../controller/discountController.js";
const router = express.Router();
router
  .route("/")
  .get(protect, admin, getDiscount)
  .post(protect, admin, createDiscount);
router
  .route("/:id")
  .delete(protect, admin, deleteDiscount)
  .get(protect, admin, getDetailDiscount)
  .put(protect, admin, updatedDiscount);
router.route("/value/:name").get(protect, applyDiscount);

export default router;
