import mongoose from "mongoose";

const DiscountModel = mongoose.Schema({
  discount_type: {
    type: String,
    required: false,
  },
  price_rule: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  discount_code: {
    type: String,
    required: false,
  },
  shopName: {
    type: String,
    required: false,
  },
});

const DiscountSchema = mongoose.model("Discount", DiscountModel);

export default DiscountSchema;
