import Timetable from '../../../database/models/timetable.model.js';
import TimetableRepositoryContract from '../contracts/timetable.repository.contract.js';

class TimetableRepository extends TimetableRepositoryContract {
  async findByTeacher(teacherId) {
    return await Timetable.find({ teacher: teacherId });
  }

  async create(timetableData) {
    const timetable = new Timetable(timetableData);
    return await timetable.save();
  }
}

export default new TimetableRepository();
