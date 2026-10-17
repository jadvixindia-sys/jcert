import { SiteSettings, SETTINGS_ID } from '../models/SiteSettings';

type SettingsInput = Partial<{
  headerLogoUrl: string | null;
  faviconUrl: string | null;
  ukrlpLogoUrl: string | null;
  footerLogoUrl: string | null;
  footerText: string | null;
}>;

export const settingsService = {
  /** Returns the singleton, creating it on first read. */
  async get() {
    const existing = await SiteSettings.findById(SETTINGS_ID).lean();
    if (existing) return existing;
    const created = await SiteSettings.create({ _id: SETTINGS_ID });
    return created.toObject();
  },

  async update(input: SettingsInput) {
    return SiteSettings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: input },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
  },
};
