const transporter = require("../config/mailer");

const sendOtpEmail = async (user, otp) => {
  if (!process.env.SMTP_HOST) {
    console.log("SMTP not configured. OTP:", otp);
    return;
  }

  const message = `Hello ${user.name},\n\nYour BITFEST verification OTP is: ${otp}\n\nThis OTP expires in 5 minutes.\n\nBITFEST Team`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "BITFEST <noreply@bitfest.edu>",
    to: user.email,
    subject: "BITFEST Email Verification OTP",
    text: message
  });
};

module.exports = { sendOtpEmail };
