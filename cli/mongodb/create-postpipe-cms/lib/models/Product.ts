import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  images: {
    type: [String],
    default: [],
  },
  stock: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = (mongoose.models.Product || mongoose.model('Product', ProductSchema)) as mongoose.Model<any>;
export default Product;
