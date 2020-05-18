const User = require("../models/user");
let mongoose = require("mongoose");
let user_helper = {};

user_helper.getUserById = async userId => {
  try {
    let data = await User.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(userId) }
      },
      {
        $unwind: "$reviews"
      },
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "review_details"
        }
      },
      {
        $unwind: "$review_details"
      },
      {
        $group: {
          _id: "$_id",
          reviews: { $first: "$reviews" },
          role: { $first: "$role" },
          emailVerified: { $first: "$emailVerified" },
          isDel: { $first: "$isDel" },
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          password: { $first: "$password" },
          createdAt: { $first: "$createdAt" },
          reviewDetails: { $addToSet: "$review_details" }
        }
      }
    ]);
    if (data) {
      return {
        status: 1,
        message: "data found",
        data: data
      };
    } else {
      return { status: 2, message: "No data found" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while fetching data",
      error: err
    };
  }
};

module.exports = user_helper;
