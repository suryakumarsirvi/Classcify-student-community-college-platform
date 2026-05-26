import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: { type: Date, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  course: { type: String, required: true }
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
