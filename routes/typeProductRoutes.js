import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  createTypeProduct,
  deleteTypeProduct,
  detailTypeProduct,
  editTypeProduct,
  getListTypeProduct,
  GetTypeProduct,
} from "../controller/typeProductController.js";
import { totalTypes } from "../controller/productController.js";
const router = express.Router();
router
  .route("/")
  .get(protect, admin, getListTypeProduct)
  .post(protect, admin, createTypeProduct);
router.route("/chart").get(protect, admin, totalTypes);
router.route("/detail").get(protect, admin, GetTypeProduct);
router
  .route("/:id")
  .get(protect, admin, detailTypeProduct)
  .post(protect, admin, editTypeProduct)
  .delete(protect, admin, deleteTypeProduct);

export default router;
