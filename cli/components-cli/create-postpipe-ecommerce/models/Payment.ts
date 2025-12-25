import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  receipt?: string;
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['created', 'paid', 'failed'], 
      default: 'created' 
    },
    receipt: { type: String }
  },
  { timestamps: true }
);

const Payment: Model<IPayment> = 
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
