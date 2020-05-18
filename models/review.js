const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const schema = new mongoose.Schema(
  {
    rating: { type: Number, required: true },
    transactionproof: { type: String },
    place: { type: String, required: true },
    review: { type: String, required: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },

  { timestamps: true, versionKey: false }
);

const Review = mongoose.model("Review", schema);

module.exports = Review;
