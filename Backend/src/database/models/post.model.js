import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  caption: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  media: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    resource_type: { type: String, enum: ['image', 'video'], required: true }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  comments: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

postSchema.index({
  caption: 'text',
  tags: 'text'
});

postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
