import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: String,
  content: { type: String, required: true },
  course: String,
  user: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
