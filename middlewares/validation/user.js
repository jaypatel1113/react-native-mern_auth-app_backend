const { check, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const { sendError } = require("../../helper/error");
const ResetToken = require("../../models/resetToken");
const User = require("../../models/user");

exports.validateUserSignUp = [
    check("fullname")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Name is required!")
        .isString()
        .withMessage("Must be a valid name!")
        .isLength({ min: 3, max: 20 })
        .withMessage("Name must be within 3 to 20 character!"),
    check("email").normalizeEmail().isEmail().withMessage("Invalid email!"),
    check("password")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Password is empty!")
        .isLength({ min: 8, max: 20 })
        .withMessage("Password must be 3 to 20 characters long!"),
    check("confirmPassword")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Confirm Password is empty!")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Both password must be same!");
            }
            return true;
        }),
];

exports.userVlidation = (req, res, next) => {
    const result = validationResult(req).array();
    if (!result.length) return next();

    const error = result[0].msg;
    sendError(res, error);

    // res.status(400).json({ success: false, message: error });
};

exports.validateUserSignIn = [
    check("email")
        .trim()
        .isEmail()
        .withMessage("email / password is required!"),
    check("password")
        .trim()
        .not()
        .isEmpty()
        .withMessage("email / password is required!"),
];

exports.isResetTokenValid = async (req, res, next) => {
    const {token, id} = req.query;
    if(!token || !id) return sendError(res, "Invalid Request!");
    if(!isValidObjectId(id)) return sendError(res, "Invalid User!");

    const user = await User.findById(id);
    if(!user) return sendError(res, "user not found!");
    
    const resetToken = await ResetToken.find({owner: user._id});
    if(!resetToken) return sendError(res, "Reset token Expired or Invalid!");

    const isValid = await resetToken.compareToken(token);
    if(!isValid) return sendError(res, "reset token invalid!");

    req.user= user;
    next();
}