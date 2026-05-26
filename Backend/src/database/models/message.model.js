import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher', 'Admin']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiverType'
  },
  receiverType: {
    type: String,
    enum: ['Student', 'Teacher', 'Admin']
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'link']
    },
    url: String,
    name: String,
    size: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

messageSchema.virtual('formattedTime').get(function () {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
