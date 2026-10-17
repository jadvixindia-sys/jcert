import { Schema, model, type InferSchemaType } from 'mongoose';

export const CERTIFICATE_LEVELS = ['Foundational', 'Intermediate', 'Professional', 'Expert'] as const;
export const CERTIFICATE_STATUSES = ['Completed', 'On Process', 'Incomplete'] as const;
export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

/**
 * NOTE: the legacy `certificateCode` (CERT-XXXXXX) was retired — the public
 * Order ID is now the single identifier. Old documents keep their stored value
 * harmlessly; it is simply no longer read, written or displayed.
 */
const certificateSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },

    candidateName: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    completionDate: { type: Date, required: true },
    // Optional. When set and in the past, the credential reads "Expired".
    expiryDate: { type: Date, default: null },
    level: { type: String, enum: CERTIFICATE_LEVELS, default: 'Professional' },
    rollNumber: { type: String, required: true, unique: true, trim: true, index: true },

    // Optional candidate details.
    photoUrl: { type: String, default: null },
    gender: { type: String, enum: [...GENDERS, null], default: null },

    institutionName: { type: String, default: 'Jadvix Academy', trim: true },
    duration: { type: String, default: 'Not Specified', trim: true },
    status: { type: String, enum: CERTIFICATE_STATUSES, default: 'Completed', index: true },

    institute: { type: Schema.Types.ObjectId, ref: 'Institute', default: null },
  },
  { timestamps: true }
);

certificateSchema.index({ createdAt: -1 });

export type CertificateAttrs = InferSchemaType<typeof certificateSchema>;
export const Certificate = model('Certificate', certificateSchema);
