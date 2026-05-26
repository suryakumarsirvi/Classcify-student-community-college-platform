import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true
    },
    remark: String
  }],
  totalPresent: {
    type: Number,
    default: 0
  },
  totalAbsent: {
    type: Number,
    default: 0
  },
  totalLate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

attendanceSchema.index({ course: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
