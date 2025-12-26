import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment cannot be empty'],
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  author: {
    type: String,
    required: true,
    default: 'Anonymous', // Or link to User model
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = (mongoose.models.Comment || mongoose.model('Comment', CommentSchema)) as mongoose.Model<any>;
export default Comment;
