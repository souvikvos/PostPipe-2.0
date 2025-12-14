import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Wishlist = (mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema)) as mongoose.Model<any>;
export default Wishlist;
