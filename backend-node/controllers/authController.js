const User = require('../models/User');
const TechnicianSubscription = require('../models/TechnicianSubscription');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpService = require('../services/otpService'); // To be implemented

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    await otpService.generateAndSendOtp(email);
    res.json({ message: `OTP sent successfully to ${email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    let { name, email, password, role, phone, otp, nicFrontUrl, nicBackUrl, ...otherFields } = req.body;
    
    if (email) email = email.toLowerCase();

    const userExists = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const isOtpValid = await otpService.verifyOtp(email, otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (phone && !/^(?:0|\+94|94)7[0-9]{8}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid Sri Lankan phone number' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let finalRole = role;
    if (email.toLowerCase() === 'tharaniyajeyapalan29@gmail.com') {
      finalRole = 'ADMIN';
    }

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      phone,
      ...otherFields
    };

    if (finalRole === 'TECHNICIAN') {
      if (!nicFrontUrl || !nicBackUrl) {
        return res.status(400).json({ message: 'NIC front and back photos are required for technicians' });
      }
      userData.technicianReference = `TECH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      userData.nicFrontUrl = nicFrontUrl;
      userData.nicBackUrl = nicBackUrl;
    }

    const user = await User.create(userData);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    let { email, password, role } = req.body;
    if (email) email = email.toLowerCase();

    // Special handling for the main admin account
    if (email === 'tharaniyajeyapalan29@gmail.com' && password === 'Tharani@2001') {
        let adminUser = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            adminUser = await User.create({
                name: 'Admin Tharani',
                email: email,
                password: hashedPassword,
                role: 'ADMIN',
                active: true
            });
        } else if (adminUser.role !== 'ADMIN') {
            adminUser.role = 'ADMIN';
            await adminUser.save();
        }

        const token = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
        return res.json({
            token,
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            technicianReference: adminUser.technicianReference,
            active: adminUser.active,
            profilePicture: adminUser.profilePicture
        });
    }

    const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: 'Access denied. Please login using the correct option.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    // Automatic Deactivation Logic for Technicians
    if (user.role === 'TECHNICIAN') {
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const registrationDate = new Date(user.createdAt);
      const now = new Date();

      if (now - registrationDate > thirtyDaysInMs) {
        // Check for at least one approved subscription
        const hasSubscription = await TechnicianSubscription.findOne({
          technicianId: user._id,
          status: 'APPROVED'
        });

        if (!hasSubscription) {
          user.active = false;
          await user.save();
          return res.status(403).json({ 
            message: 'Your account has been deactivated because you haven\'t made your monthly subscription payment. Please contact admin or subscribe to reactivate.',
            id: user._id,
            needsSubscription: true
          });
        }
      }
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
    }

    res.json({
        token,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        technicianReference: user.technicianReference,
        active: user.active,
        profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }
    await otpService.generateAndSendOtp(email);
    res.json({ message: `OTP sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const isOtpValid = await otpService.verifyOtp(email, otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
