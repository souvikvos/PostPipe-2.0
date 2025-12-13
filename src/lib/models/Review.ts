import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
  },
  author: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false, // Can be site-wide testimonial
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = (mongoose.models.Review || mongoose.model('Review', ReviewSchema)) as mongoose.Model<any>;
export default Review;
