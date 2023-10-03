import asyncHandler from "express-async-handler";
import TypeProduct from "../models/typeProductModel.js";
const getListTypeProduct = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await TypeProduct.countDocuments();
  const typeProducts = await TypeProduct.find()
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    typeProducts,
    page,
    pages: Math.ceil(count / pageSize),
  });
});
const createTypeProduct = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const exist = await TypeProduct.findOne({
    name,
  });
  if (exist) {
    throw new Error("Type product already exists");
  } else {
    await TypeProduct.create({
      name,
    });
    res.json({
      mess: "SUCCESS",
    });
  }
});

const editTypeProduct = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const nameExists = await TypeProduct.findOne({ name });
  const exists = await TypeProduct.findById(req.params.id);
  if (exists) {
    if (nameExists) {
      throw new Error("Name type product already exists");
    } else {
      exists.name = name;
      await exists.save();
      res.status(200).json({
        mess: "SUCCESS",
      });
    }
  } else {
    throw new Error("Find not found");
  }
});
const deleteTypeProduct = asyncHandler(async (req, res) => {
  const typeProduct = await TypeProduct.findById(req.params.id);
  if (typeProduct) {
    await typeProduct.remove();
    res.json({
      message: "Product deleted",
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const detailTypeProduct = asyncHandler(async (req, res) => {
  const typeProduct = await TypeProduct.findById(req.params.id);
  if (typeProduct) {
    res.json(typeProduct).status(200);
  } else {
    res.status(404);
    throw new Error("TypeProduct not found");
  }
});
const GetTypeProduct = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const typeProduct = await TypeProduct.findById(id);
  if (typeProduct) {
    res.json(typeProduct).status(200);
  } else {
    res.status(404);
    throw new Error("TypeProduct not found");
  }
});

export {
  getListTypeProduct,
  createTypeProduct,
  editTypeProduct,
  GetTypeProduct,
  deleteTypeProduct,
  detailTypeProduct,
};
