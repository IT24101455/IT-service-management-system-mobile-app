const User = require('../models/User');
const TechnicianLeave = require('../models/TechnicianLeave');
const { cloudinary } = require('../config/cloudinary');

// Helper to redact sensitive info
const redactUser = (user, requesterRole) => {
  const u = user.toObject();
  delete u.password;
  if (requesterRole !== 'ADMIN') {
    if (u.role === 'TECHNICIAN') {
      delete u.nicFrontUrl;
      delete u.nicBackUrl;
    }
  }
  return u;
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const redacted = users.map(u => redactUser(u, req.user.role));
    res.json(redacted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(redactUser(user, req.user.role));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { activeOnly } = req.query;
    const filter = { role: role.toUpperCase() };
    if (activeOnly === 'true') filter.active = true;
    
    const users = await User.find(filter);
    
    // Check leave status if role is TECHNICIAN
    const processedUsers = await Promise.all(users.map(async (u) => {
      const redacted = redactUser(u, req.user.role);
      
      if (u.role === 'TECHNICIAN') {
        const activeLeave = await TechnicianLeave.findOne({
          technicianId: u._id,
          status: 'APPROVED',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        });
        
        redacted.isAvailable = u.active && !activeLeave;
        redacted.onLeave = !!activeLeave;
      }
      
      return redacted;
    }));

    res.json(processedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'TECHNICIAN', active: true });
    
    const availableTechs = [];
    for (const tech of technicians) {
      const activeLeave = await TechnicianLeave.findOne({
        technicianId: tech._id,
        status: 'APPROVED',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });
      
      if (!activeLeave) {
        availableTechs.push(redactUser(tech, req.user.role));
      }
    }
    
    res.json(availableTechs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, department, province, district, role, specialization, experienceYears, workingDays, workingStartTime, workingEndTime, active } = req.body;

    if (phone && !/^(?:0|\+94|94)7[0-9]{8}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    Object.assign(user, { name, phone, department, province, district, role, specialization, experienceYears, workingDays, workingStartTime, workingEndTime, active });
    await user.save();
    
    res.json(redactUser(user, req.user.role));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.active = !user.active;
    await user.save();
    res.json(redactUser(user, req.user.role));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    user.profilePicture = req.file.path;
    await user.save();
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Note: Deleting from Cloudinary would require the public_id
    // For simplicity, we just clear the record here, or we could extract public_id from URL
    user.profilePicture = null;
    await user.save();
    res.json({ message: 'Profile picture removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
