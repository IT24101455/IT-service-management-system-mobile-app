const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  ticketTitle: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' },
  invoiceNumber: { type: String, unique: true },
  paymentMethod: String,
  notes: String,
  paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
