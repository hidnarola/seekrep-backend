var jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, global.gConfig.ACCESS_TOKEN_SECRET_KEY, function (err, decoded) {
            if (err) {
                return res.status(global.gConfig.UNAUTHORIZED).json({ message: err.message });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(global.gConfig.UNAUTHORIZED).json({
            message: 'Unauthorized access'
        });
    }
}