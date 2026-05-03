const express = require('express');
const router = express.Router();
const { 
  getAllAssets, 
  getAssetById, 
  getByType, 
  getByStatus, 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  getStats 
} = require('../controllers/assetController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getAllAssets);
router.get('/stats', protect, getStats);
router.get('/type/:type', protect, getByType);
router.get('/status/:status', protect, getByStatus);
router.get('/:id', protect, getAssetById);
router.post('/', protect, admin, createAsset);
router.put('/:id', protect, admin, updateAsset);
router.delete('/:id', protect, admin, deleteAsset);

module.exports = router;
