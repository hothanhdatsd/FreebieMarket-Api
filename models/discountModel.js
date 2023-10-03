import mongoose from "mongoose";
// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  expDate: {
    type: Date,
    requireed: true,
  },
});

//Export the model
const discount = mongoose.model("Discount", discountSchema);

export default discount;
