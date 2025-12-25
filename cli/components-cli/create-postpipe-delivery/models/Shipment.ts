import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShipment extends Document {
  orderId: string;
  trackingNumber?: string;
  provider: 'ShipRocket' | 'FedEx' | 'Generic';
  status: 'ordered' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned';
  history: {
    status: string;
    location?: string;
    timestamp: Date;
    description?: string;
  }[];
  createdAt: Date;
}

const ShipmentSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    trackingNumber: { type: String },
    provider: { 
      type: String, 
      enum: ['ShipRocket', 'FedEx', 'Generic'], 
      default: 'Generic' 
    },
    status: { 
      type: String, 
      enum: ['ordered', 'shipped', 'out_for_delivery', 'delivered', 'returned'], 
      default: 'ordered' 
    },
    history: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String
    }]
  },
  { timestamps: true }
);

const Shipment: Model<IShipment> = 
  mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);

export default Shipment;
