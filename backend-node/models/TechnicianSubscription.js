const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianName: String,
  amount: { type: Number, default: 1500.0 },
  paymentDate: String,
  technicianReference: String,
  referenceNumber: String,
  paymentSlipUrl: { type: String, required: true },
  month: String,
  year: Number,
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: String,
  submissionDate: { type: Date, default: Date.now },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('TechnicianSubscription', subscriptionSchema);
