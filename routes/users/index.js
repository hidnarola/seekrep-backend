const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectID;

/* Helper */
const common_helper = require("../../controller/common");
const user_helper = require("../../helper/user_helper");

/* Model */
const User = require("../../models/user");

// router.get("/profile", async (req, res) => {
//   console.log("req.......", req);
//   var resp_data = await common_helper.find(
//     User,
//     { _id: ObjectId(req.userInfo.id) },
//     1
//   );

//   if (resp_data.status == 0) {
//     res.status(global.gConfig.INTERNAL_SERVER_ERROR).json(resp_data);
//   } else {
//     res.status(global.gConfig.OK_STATUS).json(resp_data);
//   }
// });

router.get("/sellerprofile/:id", async function(req, res) {
  try {
    // console.log("ObjectId(req.userInfo.id)", ObjectId(req.userInfo.id));
    const id = req.params.id;
    console.log("id", id);
    let user = await user_helper.getUserById(id);
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

router.post("/editprofile", async function(req, res) {
  try {
    const id = req.body.userId;
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

router.post("/editprofiledata", async function(req, res) {
  var errors = req.validationErrors();
  if (!errors) {
    var obj = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
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

router.post("/search", async function(req, res) {
  try {
    const search = req.body.search;
    console.log("search", search);
    let user = null;
    if (search) {
      user = await common_helper.find(User, {
        firstName: new RegExp("^" + search, "i")
      });
    } else {
      user = await common_helper.find(User, {});
    }
    console.log("user", user);

    if (user.status === 1) {
      res.status(global.gConfig.OK_STATUS).json({ users: user });
    } else if (user.status === 2) {
      var alluser = await User.find({});
      console.log("all product", alluser);
      if (alluser) {
        res
          .status(global.gConfig.OK_STATUS)
          .json({ status: "1", message: "found all user", users: alluser });
      } else {
        res
          .status(global.gConfig.BAD_REQUEST)
          .json({ status: "2", message: "not found users" });
      }
    }
  } catch (error) {
    if (error) {
      res.status("400").json({ error: "Invalid Product id" });
      return;
    }
  }
});

router.post("/alluser", async function(req, res) {
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

// router.get("/alluser", async function(req, res) {
//   console.log("in list api");
//   var alluser = await User.find({});
//   console.log("all product", alluser);
//   if (alluser) {
//     res
//       .status(global.gConfig.OK_STATUS)
//       .json({ status: "1", message: "found all user", users: alluser });
//   } else {
//     res
//       .status(global.gConfig.BAD_REQUEST)
//       .json({ status: "2", message: "not found users" });
//   }
// });

// router.get("/alluser", async function(req, res) {
//   console.log("in list api");
//   var alluser = await User.find({});
//   const {
//     query: { currentPage, pageSize }
//   } = req;
//   const { limit, offset } = calculateLimitAndOffset(currentPage, pageSize);
//   const count = alluser.length;
//   console.log("count", count);
//   // const paginatedData = data.slice(offset, offset + limit);
//   // const paginationInfo = paginate(currentPage, count, paginatedData);
//   console.log("all product", alluser);
//   if (alluser) {
//     res
//       .status(global.gConfig.OK_STATUS)
//       .json({ status: "1", message: "found all user", users: alluser });
//   } else {
//     res
//       .status(global.gConfig.BAD_REQUEST)
//       .json({ status: "2", message: "not found users" });
//   }
// });

module.exports = router;
