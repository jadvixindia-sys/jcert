/**
 * Reset (or create) the primary admin account with a known password.
 *
 * Usage:
 *   npm run reset-admin                      # uses defaults below
 *   npm run reset-admin -- <email> <password> <displayName?>
 *
 * Intended for local setup / recovery. Change the password immediately after
 * first login via the Settings screen.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { Admin } from '../src/models/Admin';
import { env } from '../src/config/env';

const [, , emailArg, passwordArg, nameArg] = process.argv;

const email = (emailArg || 'admin@jadvix.com').toLowerCase();
const password = passwordArg || 'Jadvix@2026';
const displayName = nameArg || 'Jadvix Administrator';

async function run() {
  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_COST);

  await Admin.updateOne(
    { email },
    {
      $set: { email, displayName, passwordHash, failedLoginAttempts: 0, lockUntil: null },
    },
    { upsert: true }
  );

  console.log('✅ Admin credentials set:');
  console.log(`   email:    ${email}`);
  console.log(`   password: ${password}`);
  console.log('   ⚠️  Change this password after first login.');

  await disconnectDatabase();
}

run().catch(async (err) => {
  console.error('❌ reset-admin failed:', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
