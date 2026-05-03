const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    
    // Basic validation
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'Missing required fields: senderId, receiverId, or content' });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid sender or receiver ID format' });
    }

    console.log('Processing message from', senderId, 'to', receiverId);

    const message = await ChatMessage.create({
      senderId,
      receiverId,
      content,
      timestamp: new Date()
    });

    try {
      const sender = await User.findById(senderId);
      const io = req.app.get('io');
      
      if (io) {
        // Notify the receiver via real-time chat event
        io.to(receiverId.toString()).emit('chat_message', message);

        // Create a formal notification for the receiver
        const notif = await Notification.create({
          userId: receiverId.toString(),
          title: 'New Message',
          message: `${sender?.name || 'Someone'} sent you a message: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
          type: 'CHAT',
          relatedId: senderId.toString(),
          relatedName: sender?.name || 'User'
        });

        // Notify the receiver via real-time notification event
        io.to(receiverId.toString()).emit('notification', notif);
      }
    } catch (notifError) {
      console.error('Error in chat notification loop:', notifError);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('CRITICAL: Error in sendMessage:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    
    // Validate IDs to prevent CastErrors
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
      return res.status(400).json({ message: 'Invalid user IDs provided' });
    }

    const messages = await ChatMessage.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ receiverId: req.params.userId }).sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
