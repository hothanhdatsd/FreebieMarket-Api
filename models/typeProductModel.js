import mongoose from "mongoose";

var typeProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const TypeProduct = mongoose.model("TypeProduct", typeProductSchema);
export default TypeProduct;
