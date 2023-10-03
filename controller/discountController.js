import asyncHandler from "express-async-handler";
import Discount from "../models/discountModel.js";
const getDiscount = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Discount.countDocuments();
  const listDiscount = await Discount.find()
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    listDiscount,
    page,
    pages: Math.ceil(count / pageSize),
  });
});
const getDetailDiscount = asyncHandler(async (req, res) => {
  const discountExitst = await Discount.findById(req.params.id);
  if (discountExitst) {
    res.json(discountExitst).status(200);
  } else {
    res.status(404);
    throw new Error("Discount not found");
  }
});
const applyDiscount = asyncHandler(async (req, res) => {
  let date = new Date();
  const discountExitst = await Discount.findOne({
    name: req.params.name,
  });
  if (discountExitst) {
    if (discountExitst.expDate > date && discountExitst.startDate < date) {
      res.json(discountExitst).status(200);
    } else {
      throw new Error("The discount code is invalid.");
    }
  } else {
    res.status(404);
    throw new Error("Discount not found");
  }
});
const createDiscount = asyncHandler(async (req, res) => {
  const { name, value, startDate, expDate } = req.body;
  const discountExists = await Discount.findOne({ name });
  if (discountExists) {
    throw new Error("Discount already exists");
  } else if (startDate > expDate) {
    throw new Error("Start date must be earlier than expiry date");
  } else if (value < 0 || value > 100) {
    throw new Error("Value is out of range for 1 to 1000");
  } else {
    await Discount.create({
      name,
      value,
      startDate,
      expDate,
    });
    res.json("Discount creaeted successfully!").status(200);
  }
});
const updatedDiscount = asyncHandler(async (req, res) => {
  const { name, value, startDate, expDate } = req.body;
  if (startDate > expDate) {
    throw new Error("Start date must be earlier than expiry date");
  } else if (value < 0 || value > 100) {
    throw new Error("Value is out of range for 1 to 1000");
  } else {
    const discountExists = await Discount.findOneAndUpdate(
      { _id: req.params.id },
      {
        name,
        value,
        startDate,
        expDate,
      },
      { new: true }
    );
    await discountExists.save();
    res.json("Discount updated successfully!").status(200);
  }
});
const deleteDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const discountExists = await Discount.findByIdAndDelete(id);
  if (discountExists) {
    res.json("Discount deleted successfully!").status(200);
  }
  res.json("Discount not found");
});
export {
  getDiscount,
  createDiscount,
  updatedDiscount,
  applyDiscount,
  deleteDiscount,
  getDetailDiscount,
};
