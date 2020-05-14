
module.exports = function (req, res, next) {
    if (req.decoded.role == "user" && req.baseUrl.match('/users')) {
        req.userInfo = req.decoded;
        next();
    }
    else {
        return res.status(global.gConfig.UNAUTHORIZED).json({
            "message": 'Unauthorized access'
        });
    }
}