const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // SOFTWARE, HARDWARE, etc.
  status: { type: String, enum: ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'], default: 'ACTIVE' },
  assignedToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToUserName: String,
  location: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
