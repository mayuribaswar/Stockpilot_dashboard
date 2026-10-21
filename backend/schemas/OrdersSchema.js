const { Schema } = require("mongoose");

const OrdersSchema = new Schema(
  {
    userId: {
      type: String,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    qty: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    mode: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { OrdersSchema };
