import mongoose, { Schema, Document } from 'mongoose';

export interface ILinkDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  shortCode: string;
  originalUrl: string;
  title?: string;
  status: 'active' | 'disabled';
  expiresAt?: Date | null;
  totalClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILinkDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shortCode: { type: String, required: true, unique: true, trim: true, index: true },
    originalUrl: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active', index: true },
    expiresAt: { type: Date, default: null },
    totalClicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        ret.ownerId = ret.ownerId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user's dashboard link listing sorted by createdAt
linkSchema.index({ ownerId: 1, createdAt: -1 });

export const LinkModel = mongoose.models.Link || mongoose.model<ILinkDocument>('Link', linkSchema);
