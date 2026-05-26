import express from 'express';
import auth from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/fileUpload.middleware.js';
import { uploadResource, getResources } from './resource.controller.js';

const router = express.Router();

router.post('/', auth(['admin', 'teacher']), upload.single('file'), uploadResource);
router.get('/', auth(['admin', 'teacher', 'student']), getResources);

export default router;
