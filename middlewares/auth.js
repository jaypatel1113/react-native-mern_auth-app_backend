const jwt = require("jsonwebtoken");
const { sendError } = require("../helper/error");
const User = require("../models/user");

exports.isAuth = async (req, res, next) => {
        // console.log(req.headers);
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decode.userId);
            if (!user) {
                return sendError(res, "unauthorized access!");
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "JsonWebTokenError") {
                return sendError(res, "unauthorized access!");
            }
            if (error.name === "TokenExpiredError") {
                return sendError(res, "session expired try sign in!");
            }
            
            sendError(res, "Internal server error!");
        }
    } else {
        return sendError(res, "unauthorized access!");
    }
};
