const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String },
    firstName: String,
    lastName: String,
    profileimage: String,
    countryname: String,
    depop: String,
    eBay: String,
    facebook: String,
    instagram: String,
    grailed: String,
    stockX: String,
    facebookProvider: {
      type: {
        id: String,
        token: String
      },
      select: false
    },
    googleProvider: {
      type: {
        id: String,
        token: String
      },
      select: false
    },
    reviews: [
      {
        reviewId: {
          type: Schema.Types.ObjectId,
          ref: "Review"
        }
      },
      { rating: { type: Number } },
      { review: { type: String } },
      { username: { type: String } },
      { place: { type: String } }
    ],
    role: { type: String, default: "user" },
    emailVerified: { type: Boolean, default: false },
    isDel: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

// Create password hash middleware
schema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

// helper method to validate password
schema.methods.comparePassword = function comparePassword(
  candidatePassword,
  next
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    next(err, isMatch);
  });
};

schema.statics.upsertGoogleUser = function(
  accessToken,
  refreshToken,
  profile,
  cb
) {
  var that = this;
  return this.findOne(
    {
      "googleProvider.id": profile.id
    },
    function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          emailVerified: true,
          googleProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    }
  );
};

schema.statics.upsertFbUser = function(accessToken, refreshToken, profile, cb) {
  var that = this;
  return this.findOne(
    {
      "facebookProvider.id": profile.id
    },
    function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          emailVerified: true,
          facebookProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    }
  );
};

const User = mongoose.model("User", schema);

module.exports = User;
