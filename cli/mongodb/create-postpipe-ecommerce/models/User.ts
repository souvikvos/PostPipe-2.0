import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'user' | 'admin';
  provider?: string;
  
  // Verification
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  
  // E-commerce specific
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }[];
  wishlist?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    provider: { type: String, default: 'credentials' },

    // Verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    
    // Unified refs
    address: [{
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
