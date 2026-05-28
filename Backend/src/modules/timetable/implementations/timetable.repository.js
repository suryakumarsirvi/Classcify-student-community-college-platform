import Timetable from '../../../database/models/timetable.model.js';
import TimetableRepositoryContract from '../contracts/timetable.repository.contract.js';

class TimetableRepository extends TimetableRepositoryContract {
  async findByTeacher(teacherId) {
    return await Timetable.find({ teacher: teacherId });
  }

  async findByCourse(course) {
    return await Timetable.find({ course }).populate('teacher', 'name personal.firstName personal.lastName');
  }

  async create(timetableData) {
    const timetable = new Timetable(timetableData);
    return await timetable.save();
  }
}

export default new TimetableRepository();
