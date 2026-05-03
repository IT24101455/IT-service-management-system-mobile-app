const Asset = require('../models/Asset');

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByType = async (req, res) => {
  try {
    const assets = await Asset.find({ type: req.params.type });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByStatus = async (req, res) => {
  try {
    const assets = await Asset.find({ status: req.params.status });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    Object.assign(asset, req.body);
    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Asset.countDocuments();
    const active = await Asset.countDocuments({ status: 'ACTIVE' });
    const maintenance = await Asset.countDocuments({ status: 'UNDER_MAINTENANCE' });
    const inactive = await Asset.countDocuments({ status: 'INACTIVE' });
    res.json({ total, active, maintenance, inactive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
