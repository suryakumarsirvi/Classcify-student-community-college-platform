import mongoose from 'mongoose';
import assignmentRepository from './implementations/assignment.repository.js';
import ApiError from '../../utils/ApiError.js';

class AssignmentService {
  async createAssignment(title, description, course, dueDate, teacherId) {
    if (!title || !description || !course || !dueDate) {
      throw new ApiError(400, 'All fields are required');
    }

    return await assignmentRepository.create({
      title,
      description,
      course,
      dueDate,
      teacher: teacherId
    });
  }

  async getAssignments(userRole, userId) {
    const filter = {};
    if (userRole === 'teacher') {
      filter.teacher = new mongoose.Types.ObjectId(userId);
    }

    const assignments = await assignmentRepository.findFiltered(filter);
    return assignments || [];
  }
}

export default new AssignmentService();
