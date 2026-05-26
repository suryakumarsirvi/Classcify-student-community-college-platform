import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['study', 'accessories', 'marketplace', 'others'],
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    required: true,
  },
  media: {
    public_id: String,
    url: String,
    resource_type: String,
  },
  tags: [{
    type: String,
  }],
  isPaid: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    required: function() {
      return this.isPaid;
    },
  },
  fileSize: {
    type: String,
    required: true,
  },
  downloads: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
}, {
  timestamps: true,
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
