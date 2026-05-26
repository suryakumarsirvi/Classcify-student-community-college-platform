import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  draftId: { type: String, unique: true, index: true },
  status: { type: String, enum: ['draft', 'verified', 'active'], default: 'draft' },
  personal: {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    experience: { type: Number, required: true },
    education: { type: String, required: true },
    age: { type: Number, required: true },
    maritalStatus: { type: String, required: true },
    salary: { type: Number, required: true },
    termsAccepted: { type: String, default: false }
  },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' }
  },
  professional: {
    email: String,
    phone: String,
    classrooms: [String],
    role: String,
    yearlySalary: Number,
    joiningDate: Date,
    uid: { type: String, unique: true, sparse: true }
  },
  auth: {
    uid: { type: String, unique: true },
    password: { type: String },
    lastLogin: Date
  },
  otp: String,
  otpExpiry: Date,
  messageHistory: [{
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    type: {
      type: String,
      enum: ['sent', 'received'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
