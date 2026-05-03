const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  getUsersByRole, 
  getAvailableTechnicians, 
  updateUser, 
  deleteUser, 
  toggleActive,
  uploadProfilePicture,
  removeProfilePicture
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.get('/', protect, admin, getAllUsers);
router.get('/technicians/available', protect, getAvailableTechnicians);
router.get('/role/:role', protect, admin, getUsersByRole);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.patch('/:id/toggle-active', protect, admin, toggleActive);
router.post('/:id/profile-picture', protect, upload.single('file'), uploadProfilePicture);
router.delete('/:id/profile-picture', protect, removeProfilePicture);

module.exports = router;
