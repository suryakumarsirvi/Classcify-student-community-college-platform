import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/fileUpload.middleware.js';
import {
  createAsset,
  getAssets,
  getUserAssets,
  getMyDownloads,
  getMyFavorites,
  downloadAsset,
  toggleFavorite
} from './asset.controller.js';

const router = express.Router();

router.post('/', auth(['student']), upload.single('file'), createAsset);
router.get('/', auth(['student', 'teacher']), getAssets);
router.get('/my-assets', auth(['student']), getUserAssets);
router.get('/my-downloads', auth(['student']), getMyDownloads);
router.get('/my-favorites', auth(['student']), getMyFavorites);
router.get('/:id/download', auth(['student', 'teacher']), downloadAsset);
router.post('/:id/favorite', auth(['student']), toggleFavorite);

export default router;
