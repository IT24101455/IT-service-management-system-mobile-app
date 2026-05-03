const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['SOFTWARE', 'HARDWARE', 'NETWORK', 'OTHER'] },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'PENDING' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  technicianName: String,
  province: String,
  district: String,
  attachmentUrl: String,
  solution: String,
  slaDeadline: Date,
  rating: Number,
  ratingComment: String,
  slaBreached: { type: Boolean, default: false },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
