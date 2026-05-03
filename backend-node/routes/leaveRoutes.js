const express = require('express');
const router = express.Router();
const { 
  getAllLeaves, 
  getLeavesByTechnician, 
  createLeave, 
  updateLeaveStatus, 
  uploadMedicalReport, 
  deleteLeave 
} = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.get('/', protect, admin, getAllLeaves);
router.get('/technician/:technicianId', protect, getLeavesByTechnician);
router.post('/', protect, createLeave);
router.put('/:id/status', protect, admin, updateLeaveStatus);
router.post('/upload-report', protect, upload.single('file'), uploadMedicalReport);
router.delete('/:id', protect, deleteLeave);

module.exports = router;
