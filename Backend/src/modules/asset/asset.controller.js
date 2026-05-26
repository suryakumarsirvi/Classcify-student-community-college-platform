import assetService from './asset.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

export const createAsset = asyncHandler(async (req, res) => {
  const { name, description, subject, category, tags, isPaid, price } = req.body;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, 'File is required');
  }

  const asset = await assetService.createAsset(
    req.user._id || req.user.id,
    name,
    description,
    subject,
    category,
    tags,
    isPaid,
    price,
    file.buffer,
    file.mimetype,
    file.originalname,
    file.size
  );

  res.status(201).json(asset);
});

export const getAssets = asyncHandler(async (req, res) => {
  const { category, fileType, search, dateRange, sortBy } = req.query;
  const assets = await assetService.getAssets(req.user._id || req.user.id, {
    category,
    fileType,
    search,
    dateRange,
    sortBy
  });
  res.json(assets);
});

export const getUserAssets = asyncHandler(async (req, res) => {
  const assets = await assetService.getUserAssets(req.user._id || req.user.id);
  res.json(assets);
});

export const getMyDownloads = asyncHandler(async (req, res) => {
  const assets = await assetService.getMyDownloads(req.user._id || req.user.id);
  res.json(assets);
});

export const getMyFavorites = asyncHandler(async (req, res) => {
  const assets = await assetService.getMyFavorites(req.user._id || req.user.id);
  res.json(assets);
});

export const downloadAsset = asyncHandler(async (req, res) => {
  const downloadUrl = await assetService.downloadAsset(req.params.id, req.user._id || req.user.id);
  res.json({ downloadUrl });
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const asset = await assetService.toggleFavorite(req.params.id, req.user._id || req.user.id);
  res.json(asset);
});
