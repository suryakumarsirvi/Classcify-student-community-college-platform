import timetableRepository from './implementations/timetable.repository.js';
import ApiError from '../../utils/ApiError.js';

class TimetableService {
  async createTimetable(subject, course, startTime, endTime, teacherId) {
    if (!subject || !course || !startTime || !endTime) {
      throw new ApiError(400, 'All fields are required');
    }

    return await timetableRepository.create({
      subject,
      course,
      teacher: teacherId,
      startTime,
      endTime
    });
  }

  async getTimetable(teacherId) {
    return await timetableRepository.findByTeacher(teacherId);
  }

  async getStudentTimetable(student) {
    const course = student.academic?.course;
    if (!course) {
      return [];
    }
    return await timetableRepository.findByCourse(course);
  }
}

export default new TimetableService();
