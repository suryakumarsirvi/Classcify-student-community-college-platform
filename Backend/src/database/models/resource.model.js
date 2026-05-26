import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  classroom: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  downloads: {
    type: Number,
    default: 0
  }
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
