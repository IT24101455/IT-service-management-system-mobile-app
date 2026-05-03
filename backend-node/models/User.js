const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: String,
  institution: String,
  year: String,
  certificateUrl: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'TECHNICIAN', 'ADMIN'], default: 'USER' },
  phone: String,
  department: String,
  province: String,
  district: String,
  specialization: String,
  experienceYears: Number,
  workingDays: String,
  workingStartTime: String,
  workingEndTime: String,
  active: { type: Boolean, default: true },
  profilePicture: String,
  technicianReference: String,
  nicFrontUrl: String,
  nicBackUrl: String,
  qualifications: [qualificationSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
