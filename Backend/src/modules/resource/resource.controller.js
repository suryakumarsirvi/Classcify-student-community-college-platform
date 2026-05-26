import resourceService from './resource.service.js';
import cloudinaryService from '../../services/storage/cloudinary.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

export const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const { classroom } = req.body;
  if (!classroom) {
    throw new ApiError(400, 'Classroom is required');
  }

  let fileUrl = '';
  try {
    const result = await cloudinaryService.upload(req.file.buffer, 'classcify/resources', 'raw');
    fileUrl = result.secure_url;
  } catch (error) {
    throw new ApiError(500, 'Failed to upload resource to cloud storage');
  }

  const newResource = await resourceService.uploadResource(
    req.file.originalname,
    fileUrl,
    req.user._id || req.user.id,
    classroom
  );

  res.status(201).json({ resource: newResource });
});

export const getResources = asyncHandler(async (req, res) => {
  const resources = await resourceService.getResources();
  res.json({ resources });
});
