import Student from '../../../database/models/student.model.js';
import StudentRepositoryContract from '../contracts/student.repository.contract.js';

class StudentRepository extends StudentRepositoryContract {
  async findById(id) {
    return await Student.findById(id);
  }

  async findByEmail(email) {
    return await Student.findOne({ 'personal.email': email });
  }

  async findAll() {
    return await Student.find().select('-auth.password -auth.otp');
  }

  async search(queryStr) {
    return await Student.find({
      $or: [
        { 'personal.firstName': { $regex: queryStr, $options: 'i' } },
        { 'personal.lastName': { $regex: queryStr, $options: 'i' } },
        { 'academic.course': { $regex: queryStr, $options: 'i' } },
        { 'academic.collegeName': { $regex: queryStr, $options: 'i' } }
      ]
    })
      .select('-password -otp -verified')
      .limit(50)
      .sort({ createdAt: -1 });
  }

  async create(studentData) {
    const student = new Student(studentData);
    return await student.save();
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    return await Student.findByIdAndUpdate(id, updateData, { new: true, ...options });
  }
}

export default new StudentRepository();
