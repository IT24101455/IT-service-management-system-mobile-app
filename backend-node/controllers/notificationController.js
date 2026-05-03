const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Special handling for ADMIN group notifications
    const filter = userId === 'ADMIN' ? { userId: 'ADMIN' } : { userId: userId };
    
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;
    await Notification.updateMany({ userId: userId, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
