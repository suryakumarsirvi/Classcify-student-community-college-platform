import announcementRepository from './implementations/announcement.repository.js';
import ApiError from '../../utils/ApiError.js';

class AnnouncementService {
  async createAnnouncement(title, content, course, userId) {
    if (!title || !content || !course) {
      throw new ApiError(400, 'All fields are required');
    }

    return await announcementRepository.create({
      title,
      content,
      course,
      user: userId
    });
  }

  async getAnnouncements() {
    const list = await announcementRepository.findAll();
    if (!list || list.length === 0) {
      throw new ApiError(404, 'No announcements found');
    }
    return list;
  }
}

export default new AnnouncementService();
