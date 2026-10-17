/**
 * One-shot, idempotent migration from the legacy SQLite portal into MongoDB.
 *
 *  - Reads scripts/legacy-data.json (exported from prisma/dev.db).
 *  - Upserts by natural keys, so it is safe to re-run.
 *  - Converts epoch-ms timestamps to Date, remaps institute relations.
 *  - Copies the legacy public/uploads/* image assets into backend/uploads/.
 *
 * Run: npm run migrate
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Admin } from '../src/models/Admin';
import { Institute } from '../src/models/Institute';
import { Certificate } from '../src/models/Certificate';
import { Gallery } from '../src/models/Gallery';
import { SiteSettings, SETTINGS_ID } from '../src/models/SiteSettings';

type Legacy = {
  admins: any[];
  siteSettings: any[];
  institutes: any[];
  gallery: any[];
  certificates: any[];
};

const toDate = (v: unknown): Date => {
  if (v == null) return new Date();
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? new Date(n) : new Date(v as string);
};

const LEGACY_UPLOADS = 'D:/Fazil/Jadvix/jadvix_certificate_portal-main/public/uploads';
const TARGET_UPLOADS = path.join(process.cwd(), 'uploads');

function copyUploads() {
  if (!fs.existsSync(LEGACY_UPLOADS)) {
    console.log('⚠️  Legacy uploads folder not found, skipping asset copy');
    return;
  }
  fs.mkdirSync(TARGET_UPLOADS, { recursive: true });
  let copied = 0;
  for (const file of fs.readdirSync(LEGACY_UPLOADS)) {
    const src = path.join(LEGACY_UPLOADS, file);
    const dest = path.join(TARGET_UPLOADS, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      copied++;
    }
  }
  console.log(`📦 Copied ${copied} upload asset(s) → backend/uploads/`);
}

async function run() {
  const jsonPath = path.join(__dirname, 'legacy-data.json');
  const legacy: Legacy = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  await connectDatabase();
  console.log('🔌 Connected to MongoDB');

  copyUploads();

  // ── Admins ────────────────────────────────────────────────────────────────
  for (const a of legacy.admins) {
    await Admin.updateOne(
      { email: a.email.toLowerCase() },
      {
        $set: {
          displayName: a.displayName,
          email: a.email.toLowerCase(),
          passwordHash: a.passwordHash, // preserve existing bcrypt hash
        },
        $setOnInsert: { createdAt: toDate(a.createdAt) },
      },
      { upsert: true }
    );
  }
  console.log(`👤 Admins upserted: ${legacy.admins.length}`);

  // ── Site settings (singleton) ──────────────────────────────────────────────
  const s = legacy.siteSettings[0];
  if (s) {
    await SiteSettings.updateOne(
      { _id: SETTINGS_ID },
      {
        $set: {
          headerLogoUrl: s.headerLogoUrl ?? null,
          faviconUrl: s.faviconUrl ?? null,
          ukrlpLogoUrl: s.ukrlpLogoUrl ?? null,
          footerLogoUrl: s.footerLogoUrl ?? null,
          footerText: s.footerText ?? null,
        },
      },
      { upsert: true }
    );
    console.log('⚙️  Site settings upserted');
  }

  // ── Institutes (build oldId → ObjectId map) ────────────────────────────────
  const instituteMap = new Map<string, mongoose.Types.ObjectId>();
  for (const inst of legacy.institutes) {
    const doc = await Institute.findOneAndUpdate(
      { name: inst.name },
      {
        $set: { name: inst.name, address: inst.address, logo: inst.logo ?? null },
        $setOnInsert: { createdAt: toDate(inst.createdAt) },
      },
      { upsert: true, new: true }
    );
    instituteMap.set(inst.id, doc!._id as mongoose.Types.ObjectId);
  }
  console.log(`🏫 Institutes upserted: ${legacy.institutes.length}`);

  // ── Gallery ────────────────────────────────────────────────────────────────
  for (const g of legacy.gallery) {
    await Gallery.updateOne(
      { url: g.url },
      {
        $set: { fileName: g.fileName, url: g.url, size: g.size, mimeType: g.mimeType },
        $setOnInsert: { createdAt: toDate(g.createdAt) },
      },
      { upsert: true }
    );
  }
  console.log(`🖼️  Gallery items upserted: ${legacy.gallery.length}`);

  // ── Certificates (remap institute relation) ────────────────────────────────
  for (const c of legacy.certificates) {
    const institute = c.instituteId ? instituteMap.get(c.instituteId) ?? null : null;
    await Certificate.updateOne(
      { orderId: c.orderId },
      {
        $set: {
          orderId: c.orderId,
          candidateName: c.candidateName,
          courseName: c.courseName,
          designation: c.designation,
          completionDate: toDate(c.completionDate),
          level: c.level,
          rollNumber: c.rollNumber,
          institutionName: c.institutionName,
          duration: c.duration,
          status: c.status,
          institute,
        },
        $setOnInsert: { createdAt: toDate(c.createdAt) },
      },
      { upsert: true }
    );
  }
  console.log(`🎓 Certificates upserted: ${legacy.certificates.length}`);

  // ── Verify counts ──────────────────────────────────────────────────────────
  const counts = {
    admins: await Admin.countDocuments(),
    settings: await SiteSettings.countDocuments(),
    institutes: await Institute.countDocuments(),
    gallery: await Gallery.countDocuments(),
    certificates: await Certificate.countDocuments(),
  };
  console.log('✅ Final MongoDB counts:', counts);

  await disconnectDatabase();
  console.log('🏁 Migration complete');
}

run().catch(async (err) => {
  console.error('❌ Migration failed:', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
