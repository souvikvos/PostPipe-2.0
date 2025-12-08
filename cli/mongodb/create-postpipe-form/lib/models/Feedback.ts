import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false, // Optional for feedback
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'general', 'other'],
    default: 'general',
  },
  message: {
    type: String,
    required: [true, 'Please provide your feedback'],
    maxlength: [1000, 'Message cannot be more than 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
