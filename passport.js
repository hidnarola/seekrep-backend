const User = require("./models/user");
const FacebookTokenStrategy = require("passport-facebook-token");
const GoogleTokenStrategy = require("passport-google-token").Strategy;
const config = require("./auth-config");

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user);
    });
  });

  passport.use(
    "facebookToken",
    new FacebookTokenStrategy(
      {
        ...config.facebookAuth
      },
      async function(accessToken, refreshToken, profile, done) {
        try {
          const userFound = await User.upsertFbUser(
            accessToken,
            refreshToken,
            profile,
            function(err, user) {
              return done(err, user);
            }
          );
          userFound
            ? done(null, userFound)
            : done(new Error("User Not Found"), null);
        } catch (error) {
          done(err, null);
        }
      }
    )
  );

  passport.use(
    new GoogleTokenStrategy(
      {
        clientID: config.googleAuth.clientID,
        clientSecret: config.googleAuth.clientSecret
      },
      function(accessToken, refreshToken, profile, done) {
        User.upsertGoogleUser(accessToken, refreshToken, profile, function(
          err,
          user
        ) {
          return done(err, user);
        });
      }
    )
  );

  // passport.use(
  //   new FacebookTokenStrategy(
  //     {
  //       clientID: config.facebookAuth.clientID,
  //       clientSecret: config.facebookAuth.clientSecret
  //     },
  //     function(accessToken, refreshToken, profile, done) {
  //       User.upsertFbUser(accessToken, refreshToken, profile, function(
  //         err,
  //         user
  //       ) {
  //         return done(err, user);
  //       });
  //     }
  //   )
  // );
};

// User.findOne({ userId: profile.id }).then(existingUser => {
//   if (existingUser) {
//     done(null, existingUser);
//   } else {
//     new User({
//       userId: profile.id,
//       username: profile.displayName,
//       picture: profile._json.picture
//     })
//       .save()
//       .then(user => {
//         done(null, user);
//       });
//   }
// });
