const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectID;

/* Helper */
const common_helper = require("../../controller/common");
const user_helper = require("../../helper/user_helper");

/* Model */
const User = require("../../models/user");
const Review = require("../../models/review");

router.post("/allusersellers", async function(req, res) {
  const page = req.body.pageno || 1;
  let totalItems;
  const ITEMS_PER_PAGE = req.body.iteam_per_page || 5;

  User.find()
    .countDocuments()
    .then(numuser => {
      console.log("num user", numuser);
      totalItems = numuser;
      return User.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(user => {
      console.log("user", user);
      res.json({
        users: user,
        currentPage: page,
        totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
        perPageLimit: ITEMS_PER_PAGE
      });
    })
    .catch(err => {
      console.log(err);
    });
});

router.post("/adminadduser", async function(req, res) {
  var schema = {
    email: {
      notEmpty: true,
      errorMessage: "Email is required"
    },
    password: {
      notEmpty: true,
      errorMessage: "Password is required"
    },
    firstName: {
      notEmpty: true,
      errorMessage: "firstName is required"
    },
    lastName: {
      notEmpty: true,
      errorMessage: "lastName is required"
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var obj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      profileimage: req.body.profileimage,
      depop: req.body.depop,
      eBay: req.body.eBay,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      grailed: req.body.grailed,
      stockX: req.body.stockX
    };

    let user = await common_helper.find(
      User,
      { email: req.body.email, isDel: false },
      1
    );
    if (user.status === 1) {
      res.json({ status: 0, message: "Email is alredy registered" });
      res.status(global.gConfig.BAD_REQUEST);
    } else if (user.status === 2) {
      var register_resp = await common_helper.insert(User, obj);
      if (register_resp.status == 0) {
        res.json({
          status: 0,
          message: register_resp.message,
          register_resp
        });
      } else {
        res.status(global.gConfig.OK_STATUS).json({
          status: 1,
          message: "You are registered successfully",
          register_resp
        });
      }
    }
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

router.get("/edituser/:id", async function(req, res) {
  try {
    const id = req.params.id;
    console.log("id", id);
    let user = await common_helper.find(User, { _id: id }, 1);
    console.log("user", user);
    if (user.status === 1) {
      res
        .status(global.gConfig.OK_STATUS)
        .json({ message: "getting id", user });
    } else if (user.status === 2) {
      res.status(global.gConfig.BAD_REQUEST).json(user);
    }
  } catch (error) {
    if (error) {
      res.status("400").json({ error: "Invalid  id" });
      return;
    }
  }
});

router.post("/edituserdata", async function(req, res) {
  var errors = req.validationErrors();
  if (!errors) {
    var obj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      //   countryname: req.body.countryname,
      //   profileimage: req.body.profileimage,
      depop: req.body.depop,
      eBay: req.body.eBay,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      grailed: req.body.grailed,
      stockX: req.body.stockX
    };
    try {
      const id = req.body.id;
      const updates = req.body;
      const options = { new: true };
      console.log("id edited", id);
      console.log("updates", updates);

      const result = await User.findByIdAndUpdate(id, updates, options);
      if (!result) {
        res.json({ status: 0, message: "user does not exist" });
      } else {
        res.json({ status: 1, message: "data edited successfully", result });
      }
    } catch (error) {
      console.log(error.message);
      if (error) {
        return error;
      }
    }
  }
});

router.delete("/deleteuser/:id", async function(req, res) {
  try {
    const id = req.params.id;
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw createError(404, "User does not exist.");
    }
    res.send({
      message: "Record deleted successfully.",
      data: result,
      status: 1
    });
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      next(createError(400, "Invalid user id"));
      return;
    }
    next(error);
  }
});

// router.post("/allreviews", async function(req, res) {
//   try {
//     // const profileId = req.params.id;
//     // const ITEMS_PER_PAGE = 5;
//     const ITEMS_PER_PAGE = global.gConfig.ITEMS_PER_PAGE;
//     const page = req.body.page ? req.body.page : 1;
//     const skip = (page - 1) * ITEMS_PER_PAGE;
//     const limit = req.body.limit ? req.body.limit : global.gConfig.LIMIT; //5;

//     console.log("profileID", profileId);
//     let review = await review_helper.getAllReviews(skip, limit, page);
//     console.log("review data", review);
//     const totalrecord = await common_helper.count(Review, {
//       profileReview: profileId
//     });
//     // const totalrecord = review.length;
//     console.log("review total", totalrecord);
//     let requestData = {
//       totalRecord: totalrecord.recordsTotal,
//       limit: limit,
//       totalPages: Math.ceil(totalrecord.recordsTotal / limit),
//       page: page,
//       review
//     };
//     console.log("requestData", requestData);

//     if (review.status === 1) {
//       res
//         .status(global.gConfig.OK_STATUS)
//         .json({ message: "profile review", requestData });
//     } else if (review.status === 2) {
//       res.status(global.gConfig.BAD_REQUEST).json(review);
//     }
//   } catch (error) {
//     if (error) {
//       return error;
//     }
//   }
// });

module.exports = router;