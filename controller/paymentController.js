import asyncHandler from "express-async-handler";
import moment from "moment";
import crypto from "crypto";
import querystring from "qs";
import Order from "../models/orderModel.js";
// Define the paymentVNPay middleware
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
const paymentVNPay = asyncHandler(async (req, res, next) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = process.env.VNP_TmnCode;
  let secretKey = process.env.VNP_HashSecret;
  let vnpUrl = process.env.VNP_Url;
  let returnUrl = process.env.VNP_ReturnUrl;
  let orderId = moment(date).format("DDHHmmss");
  let amount = req.body.amount;

  let locale = req.body.language;
  if (locale === null || locale === "") {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = req.body.orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  let bankCode = "";
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
  console.log(vnpUrl);
  res.send(vnpUrl);
});
const vnpay_ipn = asyncHandler((req, res, next) => {
  var vnp_Params = req.query;
  console.log(req.query);
  var secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  var secretKey = process.env.VNP_HashSecret;

  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    var orderId = vnp_Params["vnp_TxnRef"];
    var rspCode = vnp_Params["vnp_ResponseCode"];
    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
    res.status(200).json({ RspCode: "00", Message: "success" });
  } else {
    res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
  }
});
const vnpay_return = asyncHandler((req, res, next) => {
  var vnp_Params = req.query;
  console.log(req.query);
  var secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  var tmnCode = process.env.VNP_TmnCode;
  var secretKey = process.env.VNP_HashSecret;
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    // res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
    // res.send(req.query);
  } else {
    res.render("success", { code: "97" });
  }
});
const vnpaySucces = asyncHandler(async (req, res) => {
  let date = new Date();
  const { vnp_OrderInfo, vnp_TransactionStatus } = req.query;
  if (vnp_TransactionStatus === "00") {
    const orderExists = await Order.findById(vnp_OrderInfo);
    if (orderExists) {
      orderExists.isPaid = true;
      orderExists.paidAt = moment(date).format("YYYY/MM/DD");
      orderExists.paymentResult.status = "COMPLETE";
      orderExists.paymentResult.update_time = moment(date).format("YYYY/MM/DD");
      await orderExists.save();
    }
  }
  res.redirect(`https://freebiemarket.onrender.com/order/${vnp_OrderInfo}`);
});
export { paymentVNPay, vnpay_ipn, vnpay_return, vnpaySucces };
