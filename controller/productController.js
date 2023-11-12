import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import xlsx from "xlsx";
import path from "path";
import Order from "../models/orderModel.js";

//GET all products
// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};
  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

//GET product by ID
// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { numViews: 1 } },
    { new: true }
  );
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

//ADMIN
//DELETE delete product
//DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({
      message: "Product deleted",
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

//ADMIN
//POST create product
//POST /api/products/
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, category, countInStock, description } = req.body;
  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    countInStock,
    description,
    category: {
      name: category.name,
      category: category.category,
    },
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});
const importProduct = asyncHandler(async (req, res) => {
  const __dirname = path.resolve();
  console.log(__dirname);
  const workbook = xlsx.readFile(`${__dirname}/backend/excel.xlsx`);
  const sheet_name_list = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  data.forEach(async (row) => {
    const product = new Product({
      user: req.user._id,
      name: row.name,
      price: row.price,
      image: row.image,
      countInStock: row.countInStock,
      description: row.description,
    });
    const createdProduct = await product.save();
  });
  res.status(201).json(createdProduct);
});

//ADMIN
//PUT update product
//PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, countInStock, sold, category } =
    req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.countInStock = countInStock;
    product.category.name = category.name;
    product.category.category = category.category;
    const updatedProduct = await product.save();
    res.status(201).json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({
      message: "Review added",
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .sort({
      numViews: -1,
    })
    .limit(5);

  res.json(products);
});

const getTopSellingProducts = asyncHandler(async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: "$orderItems.product",
          totalQuantity: { $sum: "$orderItems.qty" },
        },
      },
      {
        $sort: {
          totalQuantity: -1, // Sắp xếp giảm dần theo tổng số lượng bán
        },
      },
      {
        $limit: 5, // Giới hạn tối đa 5 sản phẩm
      },
    ]);

    const topSellingProducts = await Product.populate(result, {
      path: "_id",
      select: "name",
    });

    return res.status(200).json({ success: true, data: topSellingProducts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const getTotalProductsAndSalesByDay = asyncHandler(async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          isPaid: true, // Chỉ lấy ra các đơn hàng đã được giao hàng
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalProducts: { $sum: { $size: "$orderItems" } }, // Tổng số sản phẩm trong đơn hàng
          totalSales: { $sum: "$totalPrice" }, // Tổng doanh số
        },
      },
      {
        $sort: {
          "_id.day": 1,
        },
      },
      {
        $limit: 5, // Giới hạn tối đa 5 sản phẩm
      },
    ]);

    let percentageRecentDays = 0;
    let totalProductsInWeek = 0;

    const resultWithPercentage = result.map((dayData, index) => {
      const previousDayData = result[index - 1] || {
        totalProducts: 0,
        totalSales: 0,
      };
      const percentage =
        previousDayData.totalProducts !== 0
          ? ((dayData.totalProducts - previousDayData.totalProducts) /
              previousDayData.totalProducts) *
            100
          : 100;

      totalProductsInWeek += dayData.totalProducts;

      if (index === result.length - 1) {
        percentageRecentDays = percentage;
      }

      return {
        day: dayData._id.day,
        totalProducts: dayData.totalProducts,
        totalSales: dayData.totalSales,
        percentage,
      };
    });

    return res.status(200).json({
      success: true,
      data: resultWithPercentage,
      totalProductsInWeek,
      percentageRecentDays,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

//thong ke user trong thang
const totalProducts = asyncHandler(async (req, res) => {
  const date = new Date();
  const thisMonth = date.getMonth() + 1;

  const products = await Product.find({
    $expr: {
      $and: [{ $eq: [{ $month: "$createdAt" }, thisMonth] }],
    },
  });
  res.json(products);
  // res.send("OK");
});
//thong ke so loai trong thang
const totalTypes = asyncHandler(async (req, res) => {
  res.send("OK");
});
export {
  getProducts,
  getProductById,
  getTopProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  importProduct,
  totalProducts,
  totalTypes,
  getTopSellingProducts,
  getTotalProductsAndSalesByDay,
};
