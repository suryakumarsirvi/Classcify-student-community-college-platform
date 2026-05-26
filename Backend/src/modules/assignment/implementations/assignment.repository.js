import Assignment from '../../../database/models/assignment.model.js';
import Teacher from '../../../database/models/teacher.model.js';
import AssignmentRepositoryContract from '../contracts/assignment.repository.contract.js';

class AssignmentRepository extends AssignmentRepositoryContract {
  async findFiltered(filter) {
    return await Assignment.find(filter)
      .populate({
        path: 'teacher',
        model: Teacher,
        select: 'personal.firstName personal.lastName role'
      });
  }

  async create(assignmentData) {
    const assignment = new Assignment(assignmentData);
    return await assignment.save();
  }
}

export default new AssignmentRepository();
