const TechnicianSubscription = require('../models/TechnicianSubscription');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.uploadSlip = async (req, res) => {
  try {
    console.log('Upload slip hit');
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('File uploaded to:', req.file.path);
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload slip error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.submitSubscription = async (req, res) => {
  try {
    const subscription = await TechnicianSubscription.create({
      ...req.body,
      status: 'PENDING',
      submissionDate: new Date()
    });

    // Notify all admins
    const admins = await User.find({ role: 'ADMIN' });
    const io = req.app.get('io');
    
    for (const adminUser of admins) {
      const notif = await Notification.create({
        userId: adminUser._id,
        title: 'New Subscription Payment',
        message: `${subscription.technicianName} has submitted a payment slip for ${subscription.month} ${subscription.year}`,
        type: 'SYSTEM'
      });
      io.to(adminUser._id.toString()).emit('notification', notif);
    }

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await TechnicianSubscription.find({ technicianId: req.params.id }).sort({ submissionDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const subscriptions = await TechnicianSubscription.find().sort({ submissionDate: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByStatus = async (req, res) => {
  try {
    const subscriptions = await TechnicianSubscription.find({ status: req.params.status.toUpperCase() });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSubscription = async (req, res) => {
  try {
    const { adminId } = req.query;
    const subscription = await TechnicianSubscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    subscription.status = 'APPROVED';
    subscription.verifiedAt = new Date();
    subscription.verifiedBy = adminId;
    await subscription.save();

    // Notify the technician
    const io = req.app.get('io');
    const notif = await Notification.create({
      userId: subscription.technicianId,
      title: 'Subscription Approved',
      message: `Your subscription for ${subscription.month} ${subscription.year} has been approved.`,
      type: 'SYSTEM'
    });
    io.to(subscription.technicianId.toString()).emit('notification', notif);

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSubscription = async (req, res) => {
  try {
    const { adminId, reason } = req.query;
    const subscription = await TechnicianSubscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    subscription.status = 'REJECTED';
    subscription.rejectionReason = reason;
    subscription.verifiedAt = new Date();
    subscription.verifiedBy = adminId;
    await subscription.save();

    // Notify the technician
    const io = req.app.get('io');
    const notif = await Notification.create({
      userId: subscription.technicianId,
      title: 'Subscription Rejected',
      message: `Your subscription for ${subscription.month} ${subscription.year} was rejected. Reason: ${reason}`,
      type: 'SYSTEM'
    });
    io.to(subscription.technicianId.toString()).emit('notification', notif);

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
