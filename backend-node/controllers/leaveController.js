const TechnicianLeave = require('../models/TechnicianLeave');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await TechnicianLeave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeavesByTechnician = async (req, res) => {
  try {
    const leaves = await TechnicianLeave.find({ technicianId: req.params.technicianId }).sort({ startDate: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await TechnicianLeave.create({
      ...req.body,
      status: req.body.status || 'PENDING'
    });

    // Notify all admins
    const admins = await User.find({ role: 'ADMIN' });
    const io = req.app.get('io');
    
    for (const adminUser of admins) {
      const notif = await Notification.create({
        userId: adminUser._id,
        title: 'New Leave Request',
        message: `${leave.technicianName} requested time off starting ${leave.startDate.toDateString()}`,
        type: 'SYSTEM'
      });
      io.to(adminUser._id.toString()).emit('notification', notif);
    }

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await TechnicianLeave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.status = status;
    await leave.save();

    // Notify the technician
    const io = req.app.get('io');
    const notif = await Notification.create({
      userId: leave.technicianId,
      title: `Leave Request ${status}`,
      message: `Your leave request for ${leave.startDate.toDateString()} has been ${status.toLowerCase()}.`,
      type: 'SYSTEM'
    });
    io.to(leave.technicianId.toString()).emit('notification', notif);

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMedicalReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    await TechnicianLeave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
