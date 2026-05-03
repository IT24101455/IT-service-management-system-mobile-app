const express = require('express');
const router = express.Router();
const { 
  uploadSlip, 
  submitSubscription, 
  getHistory, 
  getAll, 
  getByStatus, 
  approveSubscription, 
  rejectSubscription 
} = require('../controllers/technicianSubscriptionController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/upload-slip', protect, upload.single('file'), uploadSlip);
router.post('/submit', protect, submitSubscription);
router.get('/technician/:id', protect, getHistory);
router.get('/all', protect, admin, getAll);
router.get('/status/:status', protect, admin, getByStatus);
router.put('/:id/approve', protect, admin, approveSubscription);
router.put('/:id/reject', protect, admin, rejectSubscription);

module.exports = router;
