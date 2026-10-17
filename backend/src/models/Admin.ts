import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const adminSchema = new Schema(
  {
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },

    // Brute-force protection
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export type AdminAttrs = InferSchemaType<typeof adminSchema>;
export type AdminDoc = HydratedDocument<AdminAttrs>;

export const Admin = model('Admin', adminSchema);
