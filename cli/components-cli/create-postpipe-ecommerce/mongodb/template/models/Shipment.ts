import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShipment extends Document {
  orderId: string; // Internal Order ID ref, or just string ID
  user: mongoose.Types.ObjectId;
  trackingNumber: string;
  provider: 'ShipRocket' | 'FedEx' | 'Generic';
  status: 'ordered' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned';
  currentLocation?: string;
  history: {
    status: string;
    location?: string;
    timestamp: Date;
    description?: string;
  }[];
}

const ShipmentSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    trackingNumber: { type: String },
    provider: { type: String, default: 'Generic' },
    status: { 
      type: String, 
      enum: ['ordered', 'shipped', 'out_for_delivery', 'delivered', 'returned'], 
      default: 'ordered' 
    },
    currentLocation: String,
    history: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String
    }]
  },
  { timestamps: true }
);

const Shipment: Model<IShipment> = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);
export default Shipment;
