import Teacher from '../../../database/models/teacher.model.js';
import TeacherRepositoryContract from '../contracts/teacher.repository.contract.js';

class TeacherRepository extends TeacherRepositoryContract {
  async findById(id) {
    return await Teacher.findById(id);
  }

  async findByDraftId(draftId) {
    return await Teacher.findOne({ draftId });
  }

  async findByUid(uid) {
    return await Teacher.findOne({ 'professional.uid': uid });
  }

  async findVerifiedTeachers() {
    return await Teacher.find({ status: 'verified' });
  }

  async findOneAndUpdate(filter, updateData, options = {}) {
    return await Teacher.findOneAndUpdate(filter, updateData, { new: true, ...options });
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    return await Teacher.findByIdAndUpdate(id, updateData, { new: true, ...options });
  }

  async deleteById(id) {
    return await Teacher.findByIdAndDelete(id);
  }
}

export default new TeacherRepository();
