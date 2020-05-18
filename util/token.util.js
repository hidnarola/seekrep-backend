var jwt = require("jsonwebtoken");

var createToken = function(auth) {
  return jwt.sign(
    {
      id: auth.id
    },
    "my-secret",
    {
      expiresIn: 60 * 120
    }
  );
};

module.exports = {
  generateToken: function(req, res, next) {
    req.token = createToken(req.auth);
    return next();
  },
  sendToken: function(req, res) {
    res.setHeader("x-auth-token", req.token);
    let requestData = {
      data: req.user,
      token: req.token,
      status: 1
    };
    return res.status(200).send(requestData);
  }
};
