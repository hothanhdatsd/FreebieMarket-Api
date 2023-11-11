import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generate from "../utils/generateToken.js";
import nodemailer from "nodemailer";
import { sendMail, sendEmailAccept } from "../utils/sendMail.js";
import crypto from "crypto";
import Order from "../models/orderModel.js";

// validation user && GET token
//POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    provider: "local",
  });
  if (user && (await user.matchPassword(password))) {
    res.cookie("token", generate(user._id), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generate(user._id),
      provider: user.provider,
    });
  } else {
    res.status(401);
    throw new Error("Sai tên tài khoản hoặc mật khẩu");
  }
});

// register user
//POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, password, email } = req.body;
  const userExists = await User.findOne({
    email,
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.GOOGLE_CLIENT_EMAIL}`,
      pass: `${process.env.EMAIL_APP}`,
    },
  });

  const mailOptions = {
    to: email,
    subject: "Thông báo!",
    html: `<h3>Bạn đã đăng ký tài khoản thành công.</h3>`,
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.log(error);
    } else {
      const user = await User.create({
        name,
        email,
        password,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generate(user._id),
          isAdmin: user.isAdmin,
          provider: user.provider,
        });
      } else {
        res.status(400);
        throw new Error("Invalid user ID");
      }
    }
  });
});

//GET  user && GET token
//GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("Invalid email or password");
  }
});

//update  user && GET token
//PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    (user.name = req.body.name || user.name),
      (user.email = req.body.email || user.email);
    if (req.body.password) {
      user.password = req.body.password;
    }
    const emailExists = await User.findOne({
      email: user.email,
      _id: { $ne: req.user._id },
    });
    if (emailExists) {
      res.status(404);
      throw new Error("Email already exists");
    } else {
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generate(updatedUser._id),
      });
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//reset password send mail
const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({
    email,
  });
  if (user) {
    const link = `${process.env.BASE_URL}/api/users/resetpassword/${user._id}`;
    await sendEmailAccept(user.email, "Password reset", link);
    return res
      .status(300)
      .json("password reset link sent to your email account");
  }
  res.status(400).json("User with given email doesn't exist");
});
// new password after reset password
const newPassword = asyncHandler(async (req, res) => {
  const { userid } = req.params;
  // const { newPassword } = req.body;
  const randomPassword = crypto.randomBytes(4).toString("hex");
  const user = await User.findOne({ _id: userid });
  user.password = randomPassword;
  user.save();
  await sendMail(user.email, "Password reset", randomPassword);
  res.redirect("http://localhost:3000");
  res.status(300).json("Password update successful");
});

//ADMIN
//GET  all user
//GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await User.countDocuments();
  const users = await User.find()
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

//ADMIN
//DELETE  user
//DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({
      message: "User removed",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//ADMIN
//GET  user by id
//GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//ADMIN update  user
//PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    (user.name = req.body.name || user.name),
      (user.email = req.body.email || user.email);
    user.isAdmin = req.body.isAdmin;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//Thong ke user trong thang
const totalUsers = asyncHandler(async (req, res) => {
  const date = new Date();
  const thisMonth = date.getMonth() + 1;

  const users = await User.find({
    $expr: {
      $and: [{ $eq: [{ $month: "$createdAt" }, thisMonth] }],
    },
  });

  res.json(users);
});

const calculateTotalPaymentRanking = asyncHandler(async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          isPaid: true, // Chỉ lấy ra các đơn hàng đã thanh toán
        },
      },
      {
        $group: {
          _id: "$user",
          totalPayment: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: {
          totalPayment: -1, // Sắp xếp giảm dần theo tổng số tiền thanh toán
        },
      },
    ]);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  totalUsers,
  updateUser,
  resetPassword,
  newPassword,
  calculateTotalPaymentRanking,
};
