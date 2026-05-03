const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getAllComplaints, 
  getUserComplaints, 
  resolveComplaint 
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createComplaint);
router.get('/', protect, admin, getAllComplaints);
router.get('/user', protect, getUserComplaints);
router.put('/:id/resolve', protect, admin, resolveComplaint);

module.exports = router;
