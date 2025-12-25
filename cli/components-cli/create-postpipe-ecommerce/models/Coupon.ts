import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percent' | 'flat';
  value: number; // percent (e.g. 10 for 10%) or flat amount (e.g. 500)
  minOrderValue: number;
  expiry: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    expiry: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
