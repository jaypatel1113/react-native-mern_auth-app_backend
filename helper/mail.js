const nodemailer = require("nodemailer");

exports.generateOTP = () => {
    let otp = "";
    for (let i = 0; i < 4; i++) {
        const randVal = Math.round(Math.random() * 9);
        otp = otp + randVal;
    }
    return otp;
};

// email config
exports.mailTransport = () =>
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });


exports.generateEmailTemplate = (otp) => {
    return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Jay Patel</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing our App. Use the following OTP to complete your Sign Up procedures. OTP is valid for 1 hr</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      <p style="font-size:0.9em;">Regards,<br />Jay Patel</p>
      <hr style="border:none;border-top:1px solid #eee" />
    </div>
  </div>`
}

exports.verifiedEmailTemplate = () => {
    return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Jay Patel</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing our App.  </p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Your account has been VERIFIED</h2>
      <p style="font-size:0.9em;">Regards,<br />Jay Patel</p>
      <hr style="border:none;border-top:1px solid #eee" />
    </div>
  </div>`
}

exports.generatePasswordResetTemplate = (url) => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Jay Patel</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing our App. Use the following OTP to complete your Sign Up procedures. URL is valid for 1 hr</p>
    <div style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #AAA;border-radius: 4px;">

        <a style="color: #fff; text-decoration: none;" href="${url}">
            <h2>Reset Password</h2></a>
      </div>
    <p style="font-size:0.9em;">Regards,<br />Jay Patel</p>
    <hr style="border:none;border-top:1px solid #eee" />
  </div>
</div>`
}

exports.verifiedPasswordTemplate = () => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Jay Patel</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing our App.  </p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Your has been changed Successfully</h2>
    <p style="font-size:0.9em;">Regards,<br />Jay Patel</p>
    <hr style="border:none;border-top:1px solid #eee" />
  </div>
</div>`
}