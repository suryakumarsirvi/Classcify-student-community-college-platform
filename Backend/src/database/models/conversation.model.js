import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.participantType'
    },
    participantType: {
      type: String,
      required: true,
      enum: ['Student', 'Teacher', 'Admin']
    }
  }],
  type: {
    type: String,
    enum: ['direct', 'community'],
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  lastMessageSender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'lastMessageSenderType'
  },
  lastMessageSenderType: {
    type: String,
    enum: ['Student', 'Teacher', 'Admin']
  },
  lastMessageAt: {
    type: Date
  }
}, { timestamps: true });

conversationSchema.index({ 'participants.participantId': 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
