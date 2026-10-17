import { Schema, model, type InferSchemaType } from 'mongoose';

const gallerySchema = new Schema(
  {
    fileName: { type: String, required: true },
    url: { type: String, required: true }, // relative path served from /uploads
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

export type GalleryAttrs = InferSchemaType<typeof gallerySchema>;
export const Gallery = model('Gallery', gallerySchema);
