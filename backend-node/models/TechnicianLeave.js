const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianName: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  medicalReportUrl: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('TechnicianLeave', leaveSchema);
