import express from "express";
import {
  authUser,
  calculateTotalPaymentRanking,
  deleteUser,
  getUserById,
  getUserProfile,
  getUsers,
  newPassword,
  registerUser,
  resetPassword,
  totalUsers,
  updateUser,
  updateUserProfile,
} from "../controller/userController.js";
import {admin, protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);
router.route("/chart").get(protect, admin, totalUsers);
router.get("/chart/rank", calculateTotalPaymentRanking)
router.route("/resetpassword/:userid").get(newPassword);
router.route("/resetpassword").post(resetPassword);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post("/login", authUser);
// router.get("/:id");
router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);
//ADMIN

export default router;
