import mongoose, { Schema, Document } from 'mongoose';

export interface IClickEventDocument extends Document {
  linkId: mongoose.Types.ObjectId;
  shortCode: string;
  occurredAt: Date;
  referrerHost: string | null;
  deviceType: string | null;
  browserFamily: string | null;
  countryCode: string | null;
}

const clickEventSchema = new Schema<IClickEventDocument>(
  {
    linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
    shortCode: { type: String, required: true, trim: true, index: true },
    occurredAt: { type: Date, default: Date.now, index: true },
    referrerHost: { type: String, default: null },
    deviceType: { type: String, default: null },
    browserFamily: { type: String, default: null },
    countryCode: { type: String, default: null },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id?.toString();
        ret.linkId = ret.linkId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for link analytics lookup ordered by occurredAt
clickEventSchema.index({ linkId: 1, occurredAt: -1 });

export const ClickEventModel =
  mongoose.models.ClickEvent || mongoose.model<IClickEventDocument>('ClickEvent', clickEventSchema);
