import Announcement from '../../../database/models/announcement.model.js';
import AnnouncementRepositoryContract from '../contracts/announcement.repository.contract.js';

class AnnouncementRepository extends AnnouncementRepositoryContract {
  async findAll() {
    return await Announcement.find().sort({ date: -1 });
  }

  async create(announcementData) {
    const announcement = new Announcement(announcementData);
    return await announcement.save();
  }
}

export default new AnnouncementRepository();
