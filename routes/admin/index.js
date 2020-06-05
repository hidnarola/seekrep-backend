const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

/* Helper */
const common_helper = require("../../controller/common");
const user_helper = require("../../helper/user_helper");
const review_helper = require("../../helper/review_helper");
const mail_helper = require("../../controller/mail");

/* Model */
const User = require("../../models/user");
const Review = require("../../models/review");

router.post("/allusersellers", async function(req, res) {
  try {
    // const ITEMS_PER_PAGE = 5;
    const ITEMS_PER_PAGE = global.gConfig.ITEMS_PER_PAGE;
    const page = req.body.page ? req.body.page : 1;
    const search = req.body.searchText ? req.body.searchText : null; // DM
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const limit = req.body.limit ? req.body.limit : global.gConfig.LIMIT; // 5
    var alluser = await user_helper.getUsers(skip, limit, search);
    console.log("all user", alluser);
    totalrecords = alluser.totalrecods;

    // const totalrecord = await common_helper.count(Review, { alluser });
    console.log("recordsTotal", totalrecords);

    let requestData = {
      limit: limit,
      totalPages: Math.ceil(alluser.totalrecods / limit),
      page: page,
      alluser
    };
    // console.log("requestData", requestData);
    if (alluser) {
      res
        .status(global.gConfig.OK_STATUS)
        .json({ status: "1", message: "found all user", requestData });
    } else {
      res
        .status(global.gConfig.BAD_REQUEST)
        .json({ status: "2", message: "not found users" });
    }
  } catch (error) {
    if (error) {
      return error;
    }
  }
});

router.post("/profile_verify", async (req, res) => {
  var user_resp = await common_helper.find(User, { _id: req.body.id }, 1);
  if (user_resp.status === 0) {
    res
      .status(global.gConfig.INTERNAL_SERVER_ERROR)
      .json({ status: 0, message: "Error has occured while finding user" });
  } else if (user_resp.status === 2) {
    res.json({ status: 0, message: "Invalid token entered" });
  } else if (
    user_resp &&
    user_resp.status == 1 &&
    user_resp.data.profileVerified == true
  ) {
    res.json({ message: "Profile Already verified" });
  } else if (
    user_resp &&
    user_resp.status == 1 &&
    user_resp.data.profileVerified == false &&
    req.body.status === "approve"
  ) {
    var user_update_resp = await User.updateOne(
      { _id: new ObjectId(user_resp.data._id) },
      { $set: { profileVerified: true } }
    );
    res
      .status(global.gConfig.OK_STATUS)
      .json({ status: 1, message: "Profile has been Approved" });
  } else if (
    user_resp &&
    user_resp.status == 1 &&
    user_resp.data.profileVerified == false &&
    req.body.status === "reject"
  ) {
    var user_update_resp = await User.updateOne(
      { _id: new ObjectId(user_resp.data._id) },
      { $set: { profileVerified: false } }
    );
    res
      .status(global.gConfig.OK_STATUS)
      .json({ status: 1, message: "Profile has been Rejected" });
  }
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
      countryname: req.body.countryname,
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

router.post("/profiledata", async function(req, res) {
  try {
    const id = req.body.id;
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
      countryname: req.body.countryname,
      profileimage: req.body.profileimage,
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

router.post("/allreviews", async function(req, res) {
  try {
    console.log("all review api");
    // const ITEMS_PER_PAGE = 5;
    const ITEMS_PER_PAGE = global.gConfig.ITEMS_PER_PAGE;
    const page = req.body.page ? req.body.page : 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const limit = req.body.limit ? req.body.limit : global.gConfig.LIMIT; //5;global.gConfig.LIMIT

    // console.log("profileID", profileId);
    let review = await review_helper.getAllReviews(skip, limit, page);
    console.log("review data", review);
    const totalrecord = review.totalRecords;
    // const totalrecord = await common_helper.count(Review, {
    //   profileReview: profileId
    // });
    // const totalrecord = review.length;
    console.log("review total", totalrecord);
    let requestData = {
      totalRecord: totalrecord,
      limit: limit,
      totalPages: Math.ceil(totalrecord / limit),
      page: page,
      review: review.data
    };
    console.log("requestData", requestData);

    if (review.status === 1) {
      res
        .status(global.gConfig.OK_STATUS)
        .json({ message: "profile review", requestData });
    } else if (review.status === 2) {
      res.status(global.gConfig.BAD_REQUEST).json(review);
    }
  } catch (error) {
    if (error) {
      return error;
    }
  }
});

router.post("/profileReview/:id", async function(req, res) {
  try {
    const profileId = req.params.id;
    // const ITEMS_PER_PAGE = 5;
    const ITEMS_PER_PAGE = global.gConfig.ITEMS_PER_PAGE;
    const page = req.body.page ? req.body.page : 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const limit = req.body.limit ? req.body.limit : global.gConfig.LIMIT; //5;

    console.log("profileID", profileId);
    let review = await review_helper.getReviewByProfileId(
      profileId,
      skip,
      limit,
      page
    );
    console.log("review data", review);
    const totalrecord = await common_helper.count(Review, {
      profileReview: profileId
    });
    // const totalrecord = review.length;
    console.log("review total", totalrecord);
    let requestData = {
      totalRecord: totalrecord.recordsTotal,
      limit: limit,
      totalPages: Math.ceil(totalrecord.recordsTotal / limit),
      page: page,
      review
    };
    console.log("requestData", requestData);

    if (review.status === 1) {
      res
        .status(global.gConfig.OK_STATUS)
        .json({ message: "profile review", requestData });
    } else if (review.status === 2) {
      res.status(global.gConfig.BAD_REQUEST).json(review);
    }
  } catch (error) {
    if (error) {
      return error;
    }
  }
});

router.post("/login", async (req, res) => {
  var schema = {
    email: {
      notEmpty: true,
      errorMessage: "Email is required.",
      isEmail: { errorMessage: "Please enter valid email address" }
    },
    password: {
      notEmpty: true,
      errorMessage: "password is required."
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    re = new RegExp(req.body.email, "i");
    value = {
      $regex: re
    };

    let login_resp = await common_helper.find(User, { email: value }, 1);
    console.log("login_resp", login_resp);
    if (login_resp.status === 0) {
      res.status(global.gConfig.INTERNAL_SERVER_ERROR).json({
        status: 0,
        message: "Something went wrong while finding user",
        error: login_resp.error
      });
    } else if (login_resp.status === 1) {
      if (login_resp.data.role === "admin") {
        // if (login_resp.data.isDel == false) {
        if (
          bcrypt.compareSync(req.body.password, login_resp.data.password) &&
          req.body.email.toLowerCase() == login_resp.data.email.toLowerCase()
        ) {
          var refreshToken = jwt.sign(
            { id: login_resp.data._id },
            global.gConfig.ACCESS_TOKEN_EXPIRE_TIME,
            {}
          );
          let update_resp = await common_helper.update(
            User,
            { _id: login_resp.data._id },
            { refresh_token: refreshToken, last_login: Date.now() }
          );
          var LoginJson = {
            id: login_resp.data._id,
            email: login_resp.email,
            role: "user"
          };

          var token = jwt.sign(
            LoginJson,
            global.gConfig.ACCESS_TOKEN_SECRET_KEY,
            {
              expiresIn: global.gConfig.ACCESS_TOKEN_EXPIRE_TIME
            }
          );

          delete login_resp.data.status;
          delete login_resp.data.password;
          delete login_resp.data.refresh_token;
          delete login_resp.data.last_login_date;
          delete login_resp.data.created_at;

          res.status(global.gConfig.OK_STATUS).json({
            status: 1,
            message: "Logged in successful",
            data: update_resp.data,
            token: token,
            refresh_token: refreshToken
          });
        } else {
          res.json({
            status: 0,
            message: "Invalid email address or password"
          });
        }
        // } else {
        //   res
        //     .status(global.gConfig.BAD_REQUEST)
        //     .json({ message: "Your account is not active" });
        // }
      } else {
        res
          .status(global.gConfig.OK_STATUS)
          .json({ message: "Your email is not admin email" });
      }
    } else {
      res.json({ message: "Your email is not registered" });
    }
  } else {
    res.json({ message: "Invalid email" });
  }
});

router.post("/forgot_password", async (req, res) => {
  var schema = {
    email: {
      notEmpty: true,
      errorMessage: "Email is required.",
      isEmail: { errorMessage: "Please enter valid email address" }
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    var user = await common_helper.find(User, { email: req.body.email }, 1);
    // console.log("user", user);
    if (user.status === 0) {
      res
        .status(config.INTERNAL_SERVER_ERROR)
        .json({ status: 0, message: "Error while finding email" });
    } else if (user.status === 2) {
      res
        .status(config.BAD_REQUEST)
        .json({ status: 0, message: "No user available with given email" });
    } else if (user.status === 1) {
      if (user.data.role === "admin") {
        var reset_token = Buffer.from(
          jwt.sign(
            { _id: user.data._id },
            global.gConfig.ACCESS_TOKEN_SECRET_KEY,
            {
              expiresIn: global.gConfig.ACCESS_TOKEN_EXPIRE_TIME
            }
          )
        ).toString("base64");

        let mail_resp = await mail_helper.send(
          "reset_password",
          {
            to: user.data.email,
            subject: "Reset password"
          },
          {
            reset_link:
              process.env.FRONTEND_API_LOCAL + "resetpassword/" + reset_token
          }
        );
        // global.gConfig.website_url + "/reset-password/" + reset_token;
        console.log("mailrr", mail_resp);
        console.log("reset_token", reset_token);

        if (mail_resp.status === 0) {
          res.status(global.gConfig.INTERNAL_SERVER_ERROR).json({
            status: 0,
            message: "Error occured while sending mail",
            error: mail_resp.error
          });
        } else {
          res.status(global.gConfig.OK_STATUS).json({
            status: 1,
            message: "Reset link was sent to your email address",
            token: reset_token
          });
        }
      } else {
        res.status(global.gConfig.INTERNAL_SERVER_ERROR).json({
          status: 0,
          message: "Admin email is worng"
        });
      }
    }
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

router.post("/reset_password", async (req, res) => {
  var schema = {
    token: {
      notEmpty: true,
      errorMessage: "Reset password token is required."
    },
    password: {
      notEmpty: true,
      errorMessage: "Password is required."
    }
  };

  req.checkBody(schema);
  var errors = req.validationErrors();
  if (!errors) {
    try {
      jwt.verify(
        Buffer.from(req.body.token, "base64").toString(),
        global.gConfig.ACCESS_TOKEN_SECRET_KEY,
        async (err, decoded) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              res
                .status(global.gConfig.BAD_REQUEST)
                .json({ status: 0, message: "Link has been expired" });
            } else {
              res
                .status(global.gConfig.BAD_REQUEST)
                .json({ status: 0, message: "Invalid token sent" });
            }
          } else {
            let decodeId = mongoose.Types.ObjectId(decoded._id);
            var reset_user = await common_helper.find(
              User,
              { _id: decodeId },
              1
            );
            if (reset_user.data && reset_user.status === 1) {
              if (decoded._id) {
                var update_resp = await common_helper.update(
                  User,
                  { _id: decoded._id },
                  { password: bcrypt.hashSync(req.body.password, saltRounds) }
                );
                if (update_resp.status === 0) {
                  res.status(global.gConfig.INTERNAL_SERVER_ERROR).json({
                    status: 0,
                    message: "Error occured while verifying user's email"
                  });
                } else if (update_resp.status === 2) {
                  res.status(global.gConfig.BAD_REQUEST).json({
                    status: 0,
                    message: "Error occured while reseting password of user"
                  });
                } else {
                  console.log("update_resp", update_resp);
                  res
                    .status(global.gConfig.OK_STATUS)
                    .json({ status: 1, message: "Password has been changed" });
                }
              }
            } else {
              res
                .status(global.gConfig.BAD_REQUEST)
                .json({ status: 0, message: "Link has expired" });
            }
          }
        }
      );
    } catch (error) {
      res
        .status(global.gConfig.BAD_REQUEST)
        .json({ status: 0, message: "Server Error" });
    }
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

module.exports = router;
