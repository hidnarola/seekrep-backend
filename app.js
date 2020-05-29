var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const _ = require("lodash");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const expressValidator = require("express-validator");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");

require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var reviewRouter = require("./routes/review");
var adminRouter = require("./routes/admin");

const app = express();
app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressValidator());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  // res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/review", reviewRouter);
app.use("/admin", adminRouter);

var options = {
  swaggerOptions: {
    authAction: {
      JWT: {
        name: "JWT",
        schema: {
          type: "apiKey",
          in: "header",
          name: "x-access-token",
          description: ""
        },
        value: "<JWT>"
      }
    }
  }
};

app.use(
  "/api/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);

// config variables
const config = require("./config/config.json");
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || "development";

const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

// global config
global.gConfig = finalConfig;

// file storage location
// const fileStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, 'public/images')
//   },
//   filename: (req, file, callback) => {
//     callback(null, new Date().getTime() + '-' + file.originalname)
//   },
// })

// Image type filter
// const fileFilter = (req, file, callback) => {
//   if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
//     callback(null, true)
//   } else {
//     callback(null, false)
//   }
// }

// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );

// image path url
app.use("/images", express.static(path.join(__dirname, "public/images")));

// mongoose db connection
mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.info(`DB connected Successfully on ${process.env.URI}`);
  })
  .catch(() => {
    console.error("DB connection failed");
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
