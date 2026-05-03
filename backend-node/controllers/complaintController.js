const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createComplaint = async (req, res) => {
  try {
    const { technicianId, description } = req.body;
    const user = req.user;
    
    const technician = await User.findById(technicianId);
    if (!technician) return res.status(404).json({ message: 'Technician not found' });

    const complaint = await Complaint.create({
      userId: user._id,
      userName: user.name,
      technicianId: technician._id,
      technicianName: technician.name,
      description,
      status: 'PENDING'
    });

    // Notify all admins
    const admins = await User.find({ role: 'ADMIN' });
    const io = req.app.get('io');
    
    for (const adminUser of admins) {
      const notif = await Notification.create({
        userId: adminUser._id,
        title: 'New Complaint Filed',
        message: `User ${user.name} has filed a complaint against ${technician.name}`,
        type: 'SYSTEM'
      });
      io.to(adminUser._id.toString()).emit('notification', notif);
    }

    // Broadcast refresh
    io.emit('complaint_refresh', 'REFRESH');

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'RESOLVED';
    complaint.resolutionNotes = resolutionNotes;
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
