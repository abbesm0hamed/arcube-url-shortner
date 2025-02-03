import { Schema, model } from 'mongoose';

export interface IUrl {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: Date;
}

const urlSchema = new Schema<IUrl>({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const UrlModel = model<IUrl>('Url', urlSchema);
