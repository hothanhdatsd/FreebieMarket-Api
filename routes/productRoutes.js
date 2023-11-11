import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  getProductById,
  getProducts,
  getTopProductsInOrders,
  getTopProducts,
  importProduct,
  totalProducts,
  updateProduct,
} from "../controller/productController.js";
import {admin, protect} from "../middleware/authMiddleware.js";
const router = express.Router();

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.route("/import").post(protect, admin, importProduct);
router.route("/chart").get(totalProducts);
// router.get("/top", getTopProducts);
router.get("/chart/top_product", getTopProductsInOrders)
router.route("/:id/reviews").post(protect, createProductReview);
router
  .route("/:id")
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;
