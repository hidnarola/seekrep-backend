const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;
const saltRounds = 10;
var { generateToken, sendToken } = require("../util/token.util");
var passport = require("passport");
require("../passport")(passport);

/* Helper */
const common_helper = require("../controller/common");
const mail_helper = require("../controller/mail");

/* Model */
const User = require("../models/user");

/* Register Api */
router.post("/signup", async function(req, res) {
  var schema = {
    email: {
      notEmpty: true,
      errorMessage: "Email is required"
    },
    password: {
      notEmpty: true,
      errorMessage: "Password is required"
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
      phone: req.body.phone,
      gender: req.body.gender
    };
    if (req.files && req.files["image"]) {
      var file = req.files["image"];
      var mimetype = ["image/jpeg", "image/png", "application/pdf"];
      let fileUpload = await common_helper.fileUpload(mimetype, file);
      obj.image = file.name;
    }

    let user = await common_helper.find(
      User,
      { email: req.body.email, isDel: false },
      1
    );
    if (user.status === 1) {
      res
        .status(global.gConfig.BAD_REQUEST)
        .json({ status: 0, message: "Email is alredy registered" });
    } else if (user.status === 2) {
      var register_resp = await common_helper.insert(User, obj);
      if (register_resp.status == 0) {
        res.status(global.gConfig.BAD_REQUEST).json(register_resp);
      } else {
        let mail_resp = await mail_helper.send(
          "email_confirmation",
          {
            to: req.body.email,
            subject: "Email Confirmation"
          },
          {
            link:
              // global.gConfig.website_url +
              // "/email_confirm/" +
              // register_resp.data._id
              process.env.FRONTEND_WEBSITE +
              "emailverify/" +
              register_resp.data._id
          }
        );
        res
          .status(global.gConfig.OK_STATUS)
          .json({ message: "You are registered successfully", register_resp });
      }
    }
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

/* Register api without email varification */
// router.post("/signup", async function(req, res) {
//   var schema = {
//     email: {
//       notEmpty: true,
//       errorMessage: "Email is required"
//     },
//     password: {
//       notEmpty: true,
//       errorMessage: "Password is required"
//     }
//   };
//   req.checkBody(schema);
//   var errors = req.validationErrors();
//   if (!errors) {
//     var obj = {
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       password: req.body.password,
//       profileimage: req.body.profileimage,
//       depop: req.body.depop,
//       eBay: req.body.eBay,
//       facebook: req.body.facebook,
//       instagram: req.body.instagram,
//       grailed: req.body.grailed,
//       stockX: req.body.stockX
//     };

//     let user = await common_helper.find(
//       User,
//       { email: req.body.email, isDel: false },
//       1
//     );
//     if (user.status === 1) {
//       res.json({ status: 0, message: "Email is alredy registered" });
//       res.status(global.gConfig.BAD_REQUEST);
//     } else if (user.status === 2) {
//       var register_resp = await common_helper.insert(User, obj);
//       if (register_resp.status == 0) {
//         res.status(global.gConfig.BAD_REQUEST).json(register_resp);
//       } else {
//         res
//           .status(global.gConfig.OK_STATUS)
//           .json({ message: "You are registered successfully", register_resp });
//       }
//     }
//   } else {
//     res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
//   }
// });

/* Login Api */
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
    if (login_resp.status === 0) {
      res.status(global.gConfig.INTERNAL_SERVER_ERROR).json({
        status: 0,
        message: "Something went wrong while finding user",
        error: login_resp.error
      });
    } else if (login_resp.status === 1) {
      if (login_resp.data.emailVerified == true) {
        if (login_resp.data.isDel == false) {
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
        } else {
          res
            .status(global.gConfig.BAD_REQUEST)
            .json({ message: "Your account is not active" });
        }
      } else {
        res
          .status(global.gConfig.BAD_REQUEST)
          .json({ message: "Your email is not verified" });
      }
    } else {
      res.json({ message: "Your email is not registered" });
    }
  } else {
    res.json({ message: "Invalid email" });
  }
});

/* Email Verify Api */
router.post("/email_verify/:id", async (req, res) => {
  var user_resp = await common_helper.find(User, { _id: req.params.id }, 1);
  if (user_resp.status === 0) {
    res
      .status(global.gConfig.INTERNAL_SERVER_ERROR)
      .json({ status: 0, message: "Error has occured while finding user" });
  } else if (user_resp.status === 2) {
    res.json({ status: 0, message: "Invalid token entered" });
  } else if (
    user_resp &&
    user_resp.status == 1 &&
    user_resp.data.emailVerified == true
  ) {
    res.json({ message: "Email Already verified" });
  } else if (
    user_resp &&
    user_resp.status == 1 &&
    user_resp.data.emailVerified == false
  ) {
    var user_update_resp = await User.updateOne(
      { _id: new ObjectId(user_resp.data._id) },
      { $set: { emailVerified: true } }
    );
  }
  res
    .status(global.gConfig.OK_STATUS)
    .json({ status: 1, message: "Email has been verified" });
});

/* forgot password Api */
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
    if (user.status === 0) {
      res
        .status(config.INTERNAL_SERVER_ERROR)
        .json({ status: 0, message: "Error while finding email" });
    } else if (user.status === 2) {
      res
        .status(config.BAD_REQUEST)
        .json({ status: 0, message: "No user available with given email" });
    } else if (user.status === 1) {
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
            process.env.FRONTEND_WEBSITE + "resetpassword/" + reset_token
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
    }
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

/* Reset password Api */
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

router.post("/change_password", async (req, res) => {
  var schema = {
    email: {
      notEmpty: true,
      errorMessage: "Email is required."
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
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res
            .status(global.gConfig.BAD_REQUEST)
            .json({ status: 0, message: "Server Error" });
        }
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
          if (err) {
            return res
              .status(global.gConfig.BAD_REQUEST)
              .json({ status: 0, message: "Server Error" });
          }
          let newPassword = hash;
          let user = await common_helper.find(User, { email: req.body.email });
          if (user.status === 1) {
            if (user && user.data.length > 0) {
              let updateUser = await common_helper.update(
                User,
                { _id: user.data[0]._id },
                {
                  password: newPassword
                }
              );

              res
                .status(global.gConfig.OK_STATUS)
                .json({ status: 1, message: "Password has been changed" });
            } else {
              res
                .status(global.gConfig.OK_STATUS)
                .json({ status: 0, message: "Invalid email address" });
            }
          } else {
            res
              .status(global.gConfig.OK_STATUS)
              .json({ status: 0, message: "Invalid email address" });
          }
        });
      });
    } catch (error) {
      res
        .status(global.gConfig.BAD_REQUEST)
        .json({ status: 0, message: "Server Error" });
    }
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

router.route("/auth/google").post(
  passport.authenticate("google-token", { session: false }),
  function(req, res, next) {
    if (!req.user) {
      return res.send(401, "User Not Authenticated");
    }
    req.auth = {
      id: req.user.id
    };

    next();
  },
  generateToken,
  sendToken
);

// router.route("/auth/facebook").get(
//   passport.authenticate("facebook-token", { session: false }),
//   (req, res, next) => {
//     console.log("res fb back", res);
//     console.log("res fb", req);
//     // if (!req.user) {
//     //   return res.status(401).send("User Not Authenticated");
//     // }
//     req.auth = {
//       id: req.user.id
//     };

//     next();
//   },
//   generateToken,
//   sendToken
// );

router.route("/auth/facebook").post(
  passport.authenticate("facebookToken", { session: false }),
  function(req, res, next) {
    console.log({ user: req.user });
    if (!req.user) {
      return res.send(401, "User Not Authenticated");
    }
    req.auth = {
      id: req.user.id
    };

    next();
  },
  generateToken,
  sendToken
);

// router.get(
//   "/auth/facebook",
//   passport.authenticate("facebook", {
//     profileFields: ["id", "name"]
//   })
// );

// router.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook"),
//   (req, res) => {
//     //   res.redirect("/profile");
//     console.log("res callback fb", res);
//   }
// );
module.exports = router;
