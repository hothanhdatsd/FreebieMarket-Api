import express from "express";
import {
  paymentVNPay,
  vnpay_ipn,
  vnpay_return,
  vnpaySucces,
} from "../controller/paymentController.js";
const router = express.Router();
router.post("/create_payment_url", paymentVNPay);
router.get("/paymentVNPaySuccess", vnpaySucces);

export default router;
