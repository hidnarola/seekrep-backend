const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectID;

/* Helper */
const common_helper = require("../../controller/common");

/* Model */
const User = require("../../models/user");
const Review = require("../../models/review");

// router.post("/addproduct", async function(req, res) {
//   var schema = {
//     productName: {
//       notEmpty: true,
//       errorMessage: "Product Name is required"
//     },
//     price: {
//       notEmpty: true,
//       errorMessage: "Price is required"
//     },
//     description: {
//       notEmpty: true,
//       errorMessage: "Description is required"
//     }
//   };
//   req.checkBody(schema);
//   var errors = req.validationErrors();
//   if (!errors) {
//     var obj = {
//       productName: req.body.productName,
//       price: req.body.price,
//       description: req.body.description,
//       creator: "5ebce11dad53f11938cdaaa1"
//     };
//     console.log("obj", obj);

//     let product = await common_helper.find(
//       Review,
//       { productName: req.body.productName, isDel: false },
//       1
//     );
//     if (product.status === 1) {
//       res
//         .status(global.gConfig.BAD_REQUEST)
//         .json({ status: 0, message: "Product is alredy added" });
//     } else if (product.status === 2) {
//       var add_resp = await common_helper.insert(Review, obj);
//       if (add_resp.status == 0) {
//         res.status(global.gConfig.BAD_REQUEST).json(add_resp);
//       } else {
//         res.status(global.gConfig.OK_STATUS).json({
//           message: "You are added successfully",
//           add_resp
//         });
//       }
//     }
//   } else {
//     res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
//   }
// });

router.post("/addreview", async function(req, res, next) {
  let creator;
  const post = new Review({
    rating: req.body.rating,
    transactionproof: req.body.transactionproof,
    place: req.body.place,
    review: req.body.review,
    creator: req.body.id
  });

  post
    .save()
    .then(result => {
      console.log("result", result);
      return User.findById(req.body.id);
    })
    .then(user => {
      creator = user;
      user.reviews.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        status: 1,
        message: "Review Added Successfully!",
        post: post,
        creator: { _id: creator._id }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
});

router.put("/editproduct/:id", async function(req, res) {
  try {
    const id = req.params.id;
    const updates = req.body;
    const options = { new: true };

    const result = await Review.findByIdAndUpdate(id, updates, options);
    if (!result) {
      throw createError(404, "Product does not exist");
    }
    res.send(result);
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      return next(createError(400, "Invalid Product Id"));
    }

    next(error);
  }
  //   var id = req.params.id;
  //   console.log("id", id);
  //   var obj = {
  //     productName: req.body.productName,
  //     price: req.body.price,
  //     description: req.body.description
  //   };

  //   var update_resp = await common_helper.update(Product, id, obj);
  //   if (update_resp.status == 2) {
  //     res.status(global.gConfig.BAD_REQUEST).json(update_resp);
  //   } else if (update_resp.status == 1) {
  //     res.status(global.gConfig.OK_STATUS).json({
  //       message: "You are updated successfully",
  //       update_resp
  //     });
  //   } else {
  //     res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  //   }
});

router.delete("/deletproduct/:id", async function(req, res) {
  try {
    const id = req.params.id;
    const result = await Review.findByIdAndDelete(id);
    if (!result) {
      throw createError(404, "Product does not exist.");
    }
    res.send({ message: "Record deleted successfully.", data: result });
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      next(createError(400, "Invalid Product id"));
      return;
    }
    next(error);
  }
  //   console.log("req.body.id", req.body.id);
  //   var del_resp = await common_helper.delete(Product, { id: req.body.id });
  //   console.log("req.body._id", req.body.id);
  //   console.log("respo", del_resp);
  //   if (del_resp.status == 1) {
  //     res.status(global.gConfig.OK_STATUS).json({
  //       message: "data deteled successfully",
  //       del_resp
  //     });
  //   } else if (del.status === 2) {
  //     res
  //       .status(global.gConfig.BAD_REQUEST)
  //       .json({ status: 0, message: "data is not deleted" });
  //   } else {
  //     res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  //   }
});
router.get("/list", async function(req, res) {
  console.log("in list api");
  var allproduct = await Review.find({});
  console.log("all product", allproduct);
  if (allproduct) {
    res
      .status(global.gConfig.OK_STATUS)
      .json({ message: "data fetched", allreviews: allproduct });
  } else {
    res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
  }
});

router.get("/:id", async function(req, res) {
  try {
    const id = req.params.id;
    let product = await common_helper.find(Review, { _id: id }, 1);
    if (product.status === 1) {
      res
        .status(global.gConfig.OK_STATUS)
        .json({ message: "getting id", product });
    } else if (product.status === 2) {
      res.status(global.gConfig.BAD_REQUEST).json(product);
    }
  } catch (error) {
    if (error instanceof mongoose.CastError) {
      next(createError(400, "Invalid Product id"));
      return;
    }
  }
});

// router.get("/productlist", async function(req, res) {
//   console.log("req", req);
//   console.log("res", res);
//   //   var list = Product.find()
//   //     .then(notes => {
//   //       res.send(notes);
//   //     })
//   //     .catch(err => {
//   //       res.status(500).send({
//   //         message: err.message || "Some error occurred while retrieving notes."
//   //       });
//   //     });
//   //   console.log("list", list);

//   //   var productdata = {
//   //     _id,
//   //     productName,
//   //     price,
//   //     description
//   //   };
//   //   var allproduct = await Product.find({});
//   //   console.log("all product", allproduct);
//   //   if (allproduct.status === 1) {
//   //     res
//   //       .status(global.gConfig.OK_STATUS)
//   //       .json({ message: "getting id", allproduct });
//   //   } else if (allproduct.status === 2) {
//   //     res.status(global.gConfig.BAD_REQUEST).json(allproduct);
//   //   } else {
//   //     res.status(global.gConfig.BAD_REQUEST).json({ message: errors });
//   //   }
// });

module.exports = router;
