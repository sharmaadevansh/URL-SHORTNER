import mongoose, { Schema } from 'mongoose';
const analyticsSummarySchema = new Schema({
    linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
    bucketStart: { type: Date, required: true },
    bucketSize: { type: String, enum: ['hour', 'day'], required: true },
    totalClicks: { type: Number, default: 0 },
}, {
    timestamps: { createdAt: false, updatedAt: true },
});
analyticsSummarySchema.index({ linkId: 1, bucketStart: 1, bucketSize: 1 }, { unique: true });
export const AnalyticsSummaryModel = mongoose.models.AnalyticsSummary ||
    mongoose.model('AnalyticsSummary', analyticsSummarySchema);
