import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
