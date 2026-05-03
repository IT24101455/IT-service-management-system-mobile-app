const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianName: String,
  description: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'RESOLVED'], default: 'PENDING' },
  resolutionNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
