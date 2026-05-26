import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: function () { return [this.creator]; }
  }],
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  pendingJoinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'pendingJoinRequests.userType',
      required: true
    },
    userType: {
      type: String,
      enum: ['Student', 'Teacher', 'Admin'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const Community = mongoose.model('Community', communitySchema);

export default Community;
