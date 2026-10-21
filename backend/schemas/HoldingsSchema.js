const { Schema } = require("mongoose");

const HoldingsSchema = new Schema(
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

    avg: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    net: String,

    day: String,
  },
  {
    timestamps: true,
  }
);

module.exports = { HoldingsSchema };
