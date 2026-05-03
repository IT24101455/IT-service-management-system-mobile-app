const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: String, // TICKET_CREATED, TICKET_ASSIGNED, etc.
  ticketId: String, // Legacy support
  relatedId: String, // Flexible ID for navigation (Ticket ID, User ID for chat, etc.)
  relatedName: String, // Name for navigation (Technician Name, etc.)
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
