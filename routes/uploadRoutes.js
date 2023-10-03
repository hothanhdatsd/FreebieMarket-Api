import path from "path";
import express from "express";
import multer from "multer";
const router = express.Router();
import uploadCloud from "../middleware/cloudinary.config.js";

router.post(
  "/cloudinary-upload",
  uploadCloud.single("file"),
  (req, res, next) => {
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    res.json({ secure_url: req.file.path });
  }
);

export default router;
