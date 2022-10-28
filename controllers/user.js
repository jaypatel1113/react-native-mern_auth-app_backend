const jwt = require("jsonwebtoken");
const User = require("../models/user");
const VerificationToken = require("../models/verificationToken");
const ResetToken = require("../models/resetToken");
const cloudinary = require("../helper/imageUpload");
const { sendError, createRandomBytes } = require("../helper/error");
const { generateOTP, mailTransport, generateEmailTemplate, verifiedEmailTemplate, generatePasswordResetTemplate, verifiedPasswordTemplate } = require("../helper/mail");
const { isValidObjectId } = require("mongoose");

exports.createUser = async (req, res) => {
    const { fullname, email, password } = req.body;
    // const isNewUser = await User.isThisEmailInUse(email);
    // if (!isNewUser)
    //     return res.json({
    //         success: false,
    //         message: "This email is already in use, try sign-in",
    //     });
    const olduser = await User.findOne({ email });
    // console.log(olduser);
    if (olduser)
        return sendError(res, "This email is already in use, try sign-in");

    const newUser = await User({
        fullname,
        email,
        password,
    });

    // creating token and validating email using verification code
    const OTP = generateOTP();
    // console.log(OTP);
    const verifyToken = await VerificationToken({
        owner: newUser._id,
        token: OTP,
    })
    
    mailTransport().sendMail({
        from:process.env.EMAIL,
        to: newUser.email,
        subject: "verify your email account",
        html:generateEmailTemplate(OTP)
    })

    await verifyToken.save();
    await newUser.save();
    res.json({ success: true, newUser });
};

exports.verifyEmail = async (req, res) => {
    const {id, otp} = req.body;
    if(!id || !otp.trim()) return sendError(res, "Invalid Request, missing parameters!")
    if(!isValidObjectId(id)) return sendError(res, "Invalid user id");

    const user = await User.findById(id);
    // console.log(user);
    if(!user) return sendError(res, "sorry, user not found");
    
    if(user.verified) return sendError(res, "this account is already veriified!");
    const token = await VerificationToken.findOne({owner: user._id});
    if(!token) return sendError(res, "sorry, user not found");
    
    const isMatched = await token.comparePassword(otp);
    // console.log(isMatched);
    if(!isMatched) return sendError(res, "incorrect OTP!");
    
    await User.findByIdAndUpdate(id, {verified: true})
    await VerificationToken.findByIdAndDelete(token._id);

    mailTransport().sendMail({
        from:process.env.EMAIL,
        to: user.email,
        subject: "Email Verified Successfully",
        html:verifiedEmailTemplate()
    })

    res.json({ success: true, message: "Your email is verified successfully!" });
}

exports.forgetPassword = async (req, res) => {
    const {email} = req.body;
    if(!email) return sendError(res, "Please enter a valid email!");
    
    const user = await User.findOne({email});
    if(!user) return sendError(res, "User not found!");
    
    const token = await ResetToken.findOne({owner: user._id});
    if(token) return sendError(res, "After only 1hr you can request for another token!");
    
    const randomBytes = await createRandomBytes();
    // console.log(randomBytes);
    const resetToken = await ResetToken({
        owner: user._id, token: randomBytes
    })
    await resetToken.save();
    
    mailTransport().sendMail({
        from:process.env.EMAIL,
        to: user.email,
        subject: "Password Reset Link",
        html:generatePasswordResetTemplate(`https://jay-react-resetpass-authapp.netlify.app/reset-password?token=${randomBytes}&id=${user._id}`)
    })
    res.json({ success: true, message: "Password reset link sent successfully!" });
}

exports.resetPassword = async (req, res) => {
    const {password} = req.body;
    console.log(password)
    
    const user = await User.findById(req.user._id);
    if(!user) return sendError(res, "user not found!");
    
    const isSamePassword = await user.comparePassword(password);
    console.log(isSamePassword);
    console.log("one")
    
    if(isSamePassword) return sendError(res, "new Password must be different!");
    console.log("tow")
    if(password.trim().length < 8 || password.trim().length > 20) {
        console.log("threee");
        return sendError(res, "password must be 8 to 20 char long!");
    }
    console.log("four")
    
    
    // await User.findByIdAndUpdate(req.user._id, {password});
    // user.save()
    console.log("first")
    user.password = password.trim();
    console.log("seconf")
    await user.save();
    console.log("third")
    await ResetToken.findOneAndDelete({owner: user._id});
    console.log("forth")
    console.log(user.email);

    mailTransport().sendMail({
        from:process.env.EMAIL,
        to: user.email,
        subject: "Password Changed Successfully",
        html:verifiedPasswordTemplate()
    })
    
    res.json({ success: true, message: "Your password is changed successfully!" });
}


exports.userSignIn = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
        return sendError(res, "user not found, with the given email!"); 

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        return sendError(res, "email / password does not match!");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
        oldTokens = oldTokens.filter((t) => {
            const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
            if (timeDiff < 86400) {
                return t;
            }
        });
    }

    await User.findByIdAndUpdate(user._id, {
        tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    });

    const userInfo = {
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar ? user.avatar : "",
    };

    res.json({ success: true, user: userInfo, token });
};

exports.uploadProfile = async (req, res) => {
    const { user } = req;
    if (!user)
        return sendError(res, "unauthorized access!");

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${user._id}_profile`,
            width: 500,
            height: 500,
            crop: "fill",
        });

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { avatar: result.url },
            { new: true }
        );
        res.status(201).json({
            success: true,
            message: "Your profile has updated!",
        });
    } catch (error) {
        sendError(res, "server error, try after some time!", 500);
        // console.log("Error while uploading profile image", error.message);
    }
};

exports.signOut = async (req, res) => {
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Authorization fail!" });
        }

        const tokens = req.user.tokens;

        const newTokens = tokens.filter((t) => t.token !== token);

        await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
        res.json({ success: true, message: "Sign out successfully!" });
    }
};
