import announcementService from './announcement.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, course } = req.body;
  const userId = req.user._id || req.user.id;
  const announcement = await announcementService.createAnnouncement(title, content, course, userId);
  res.status(201).json({ success: true, announcement });
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAnnouncements();
  res.status(200).json({ success: true, announcements });
});
