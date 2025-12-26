import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  excerpt: String,
  author: String, // Can be replaced with User ref if needed
  tags: [String],
  published: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = (mongoose.models.Post || mongoose.model('Post', PostSchema)) as mongoose.Model<any>;
export default Post;
