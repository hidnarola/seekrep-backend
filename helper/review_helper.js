const Review = require("../models/review");
let mongoose = require("mongoose");
let review_helper = {};

review_helper.getReviewByProfileId = async (profileId, skip, limit, page) => {
  try {
    let data = await Review.aggregate([
      {
        $match: {
          profileReview: mongoose.Types.ObjectId(profileId)
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator_details"
        }
      },
      {
        $unwind: {
          path: "$creator_details",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $group: {
          _id: "$_id",
          rating: { $first: "$rating" },
          transactionproof: { $first: "$transactionproof" },
          place: { $first: "$place" },
          review: { $first: "$review" },
          profileReview: { $first: "$profileReview" },
          createdAt: { $first: "$createdAt" },

          creator_details: {
            $first: {
              _id: "$creator_details._id",
              firstName: "$creator_details.firstName",
              lastName: "$creator_details.lastName",
              email: "$creator_details.email",
              profileimage: "$creator_details.profileimage"
            }
          }
        }
      }
    ]);
    if (data) {
      console.log("review LOG", data);

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

module.exports = review_helper;
