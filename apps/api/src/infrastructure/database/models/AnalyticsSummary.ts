import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSummaryDocument extends Document {
  linkId: mongoose.Types.ObjectId;
  bucketStart: Date;
  bucketSize: 'hour' | 'day';
  totalClicks: number;
  updatedAt: Date;
}

const analyticsSummarySchema = new Schema<IAnalyticsSummaryDocument>(
  {
    linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
    bucketStart: { type: Date, required: true },
    bucketSize: { type: String, enum: ['hour', 'day'], required: true },
    totalClicks: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

analyticsSummarySchema.index({ linkId: 1, bucketStart: 1, bucketSize: 1 }, { unique: true });

export const AnalyticsSummaryModel =
  mongoose.models.AnalyticsSummary ||
  mongoose.model<IAnalyticsSummaryDocument>('AnalyticsSummary', analyticsSummarySchema);
