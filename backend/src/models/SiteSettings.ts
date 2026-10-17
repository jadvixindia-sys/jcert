import { Schema, model, type InferSchemaType } from 'mongoose';

/** Singleton document keyed by a fixed _id ('default'). */
const siteSettingsSchema = new Schema(
  {
    _id: { type: String, default: 'default' },
    headerLogoUrl: { type: String, default: null },
    faviconUrl: { type: String, default: null },
    ukrlpLogoUrl: { type: String, default: null },
    footerLogoUrl: { type: String, default: null },
    footerText: {
      type: String,
      default:
        'As JADVIX LTD (UKPRN: 10099758), a UK Register of Learning Providers (UKRLP) Registered provider.',
    },
  },
  { timestamps: true, _id: false }
);

export type SiteSettingsAttrs = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettings = model('SiteSettings', siteSettingsSchema);

export const SETTINGS_ID = 'default';
