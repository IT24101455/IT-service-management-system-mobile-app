const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getConversation, 
  getInbox 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/conversation', protect, getConversation);
router.get('/inbox/:userId', protect, getInbox);

module.exports = router;
