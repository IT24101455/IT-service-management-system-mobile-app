const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

// Mock email transport - you should configure real SMTP in .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.generateAndSendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Delete existing OTP for this email
  await Otp.deleteMany({ email });
  
  // Save new OTP
  await Otp.create({ email, otp });

  console.log(`Generated OTP for ${email}: ${otp}`);

  // Send Email
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'TechNova - Your OTP for Verification',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
};

exports.verifyOtp = async (email, otp) => {
  const record = await Otp.findOne({ email, otp });
  if (record) {
    await Otp.deleteOne({ _id: record._id });
    return true;
  }
  return false;
};
