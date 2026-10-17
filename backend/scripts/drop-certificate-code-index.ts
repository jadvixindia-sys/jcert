/**
 * Retires the legacy `certificateCode` field.
 *
 * The old schema had a UNIQUE index on `certificateCode`. Now that the field is
 * no longer written, every new document would have it "missing" — and a plain
 * unique index treats repeated missing values as duplicates, so the *second*
 * new certificate would fail with E11000. Dropping the index fixes that.
 *
 * Index-only by default: existing documents keep their stored certificateCode
 * value, so nothing is lost and the currently-deployed build keeps rendering.
 * Pass --purge to also unset the field from all documents.
 *
 * Run: npm run drop-cert-code            (safe, index only)
 *      npm run drop-cert-code -- --purge (also removes the stored values)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db';

const PURGE = process.argv.includes('--purge');

async function run() {
  await connectDatabase();
  const collection = mongoose.connection.collection('certificates');

  const indexes = await collection.indexes();
  const target = indexes.find((i) => i.key && 'certificateCode' in i.key);

  if (target?.name) {
    await collection.dropIndex(target.name);
    console.log(`✅ Dropped index "${target.name}" on certificateCode`);
  } else {
    console.log('ℹ️  No certificateCode index found — nothing to drop');
  }

  if (PURGE) {
    const res = await collection.updateMany({}, { $unset: { certificateCode: '' } });
    console.log(`🧹 Removed certificateCode from ${res.modifiedCount} document(s)`);
  } else {
    console.log('ℹ️  Existing certificateCode values left intact (pass --purge to remove)');
  }

  await disconnectDatabase();
  console.log('🏁 Done');
}

run().catch(async (err) => {
  console.error('❌ Failed:', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
