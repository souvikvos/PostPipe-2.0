import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnRequest extends Document {
  orderId: string;
  user: mongoose.Types.ObjectId;
  items: {
      productId: mongoose.Types.ObjectId;
      quantity: number;
      reason: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  adminComment?: string;
  refundAmount: number;
  refundId?: string; // from Payment Gateway
}

const ReturnRequestSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        reason: String
    }],
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'refunded'], 
        default: 'pending' 
    },
    adminComment: String,
    refundAmount: Number,
    refundId: String
  },
  { timestamps: true }
);

const ReturnRequest: Model<IReturnRequest> = mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>('ReturnRequest', ReturnRequestSchema);
export default ReturnRequest;
