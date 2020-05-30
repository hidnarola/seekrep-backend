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
        $unwind: {
          path: "$reviews",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "reviews._id",
          foreignField: "_id",
          as: "review_details"
        }
      },
      {
        $unwind: {
          path: "$review_details",
          preserveNullAndEmptyArrays: true
        }
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
          depop: { $first: "$depop" },
          eBay: { $first: "$eBay" },
          facebook: { $first: "$facebook" },
          instagram: { $first: "$instagram" },
          grailed: { $first: "$grailed" },
          profileimage: { $first: "$profileimage" },
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

// user_helper.getUsers = async (skip, limit, page) => {
user_helper.getUsers = async (skip, limit, search) => {
  var defaultQuery = [
    { $skip: skip },
    { $limit: limit },
    {
      $unwind: {
        path: "$reviews",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "reviews",
        localField: "reviews._id",
        foreignField: "_id",
        as: "review_details"
      }
    },
    {
      $unwind: {
        path: "$review_details",
        preserveNullAndEmptyArrays: true
      }
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
        profileimage: { $first: "$profileimage" },
        email: { $first: "$email" },
        password: { $first: "$password" },
        createdAt: { $first: "$createdAt" },
        reviewDetails: { $addToSet: "$review_details" },
        avgRating: { $avg: "$review_details.rating" }
      }
    }
  ];

  if (search) {
    var searchQuery = {
      $match: {
        firstName: new RegExp("^" + search, "i")
      }
    };
    defaultQuery.push(searchQuery);
  }

  try {
    let data = await User.aggregate(defaultQuery);
    if (data) {
      return {
        data: data,
        totalrecods: data.length
      };
    } else {
      return { data: null };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while fetching data",
      error: err
    };
  }
};

// user_helper.getsearchUsers = async (skip, limit, page, search) => {
//   try {
//     let data = await User.aggregate([
//       {
//         $match: { firstName: new RegExp("^" + search, "i") }
//       },
//       { $skip: skip },
//       { $limit: limit },
//       {
//         $unwind: {
//           path: "$reviews",
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $lookup: {
//           from: "reviews",
//           localField: "reviews._id",
//           foreignField: "_id",
//           as: "review_details"
//         }
//       },
//       {
//         $unwind: {
//           path: "$review_details",
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       {
//         $group: {
//           _id: "$_id",
//           reviews: { $first: "$reviews" },
//           role: { $first: "$role" },
//           emailVerified: { $first: "$emailVerified" },
//           isDel: { $first: "$isDel" },
//           firstName: { $first: "$firstName" },
//           lastName: { $first: "$lastName" },
//           profileimage: { $first: "$profileimage" },
//           email: { $first: "$email" },
//           password: { $first: "$password" },
//           createdAt: { $first: "$createdAt" },
//           reviews: { $addToSet: "$review_details" },
//           avgRating: { $avg: "$review_details.rating" }
//         }
//       }
//     ]);
//     if (data) {
//       return {
//         data: data,
//         totalrecods: data.length
//       };
//     } else {
//       return { data: null };
//     }
//   } catch (err) {
//     return {
//       status: 0,
//       message: "Error occurred while fetching data",
//       error: err
//     };
//   }
// };

module.exports = user_helper;
