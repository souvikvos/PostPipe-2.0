import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);
