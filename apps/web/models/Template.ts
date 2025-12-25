import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  slug: string;
  category?: string;
  tags: string[];
  author: {
    name?: string;
    profileUrl?: string;
  };
  thumbnailUrl?: string;
  demoGifUrl?: string;
  cli: string;
  aiPrompt?: string;
  npmPackageUrl: string;
  version?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    author: {
      name: { type: String, trim: true },
      profileUrl: { type: String, trim: true },
    },
    thumbnailUrl: { type: String, trim: true },
    demoGifUrl: { type: String, trim: true },
    cli: { type: String, required: true, trim: true },
    aiPrompt: { type: String, trim: true },
    npmPackageUrl: { type: String, required: true, trim: true },
    version: { type: String, trim: true },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Prevent overwriting the model if it already exists (Next.js hot reload issue)
const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;
