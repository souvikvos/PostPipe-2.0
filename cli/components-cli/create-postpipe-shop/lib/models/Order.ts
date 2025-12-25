import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: String, // Snapshot of name at time of order
      price: Number, // Snapshot of price at time of order
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentIntentId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = (mongoose.models.Order || mongoose.model('Order', OrderSchema)) as mongoose.Model<any>;
export default Order;
