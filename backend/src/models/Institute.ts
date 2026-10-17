import { Schema, model, type InferSchemaType } from 'mongoose';

const instituteSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    logo: { type: String, default: null },

    // Optional signatories — omitted from the certificate when left blank.
    trainerName: { type: String, default: null, trim: true },
    founderName: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

export type InstituteAttrs = InferSchemaType<typeof instituteSchema>;
export const Institute = model('Institute', instituteSchema);
