import mongoose, { Schema, Document, Model } from 'mongoose';

// Minimal Cart for Session persistence if needed
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
  }[];
}

const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }]
  },
  { timestamps: true }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
