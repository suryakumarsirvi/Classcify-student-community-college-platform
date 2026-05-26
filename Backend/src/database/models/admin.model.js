import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    default: process.env.ADMIN_EMAIL
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
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
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
