var express = require("express");
var router = express.Router();

var auth = require("../middlewares/auth");
var authorization = require("../middlewares/authorization");

var index = require("./admin/index");

router.use("/", index);

module.exports = router;
