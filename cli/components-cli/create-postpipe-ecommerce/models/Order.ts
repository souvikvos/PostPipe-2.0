import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;       // Snapshot
    price: number;      // Snapshot
    quantity: number;
  }[];
  total: number;
  subtotal: number;
  discount: number;
  
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  
  paymentMethod: 'razorpay' | 'cod';
  paymentInfo?: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      status: string;
  };
  
  shippingAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
  };

  couponApplied?: string; // Code

  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 }
    }],
    total: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
    paymentInfo: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        status: String
    },
    
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String
    },
    
    couponApplied: String
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
