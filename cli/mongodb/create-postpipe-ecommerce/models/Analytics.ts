import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  eventName: string;
  url: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true, index: true },
    url: { type: String },
    metadata: { type: Map, of: Schema.Types.Mixed }, // Flexible JSON
    sessionId: { type: String },
  },
  { timestamps: true }
);

const Analytics: Model<IAnalytics> = 
  mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics;
