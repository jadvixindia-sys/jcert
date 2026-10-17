import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { signSession } from '../utils/jwt';

export const authService = {
  /**
   * Verify credentials with per-account lockout. Uses a constant "Invalid
   * credentials" message so an attacker can't distinguish unknown email from
   * wrong password. Runs bcrypt even for unknown users to avoid timing leaks.
   */
  async login(email: string, password: string) {
    const admin = await Admin.findOne({ email }).select('+passwordHash');

    // Dummy hash to equalize timing when the account doesn't exist.
    const hash = admin?.passwordHash ?? '$2a$12$0000000000000000000000000000000000000000000000000000';

    if (admin?.lockUntil && admin.lockUntil > new Date()) {
      throw ApiError.tooMany('Account temporarily locked due to failed attempts. Try again later.');
    }

    const valid = await bcrypt.compare(password, hash);

    if (!admin || !valid) {
      if (admin) await registerFailure(admin);
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Success — clear counters.
    if (admin.failedLoginAttempts || admin.lockUntil) {
      admin.failedLoginAttempts = 0;
      admin.lockUntil = null;
      await admin.save();
    }

    const token = signSession({ sub: admin.id, email: admin.email, name: admin.displayName });
    return {
      token,
      admin: { id: admin.id, email: admin.email, displayName: admin.displayName },
    };
  },

  async updateProfile(
    adminId: string,
    input: { displayName?: string; oldPassword?: string; newPassword?: string }
  ) {
    const admin = await Admin.findById(adminId).select('+passwordHash');
    if (!admin) throw ApiError.notFound('Admin not found');

    if (input.displayName) admin.displayName = input.displayName;

    if (input.newPassword) {
      const matches = await bcrypt.compare(input.oldPassword ?? '', admin.passwordHash);
      if (!matches) throw ApiError.badRequest('Current password is incorrect');
      admin.passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_COST);
    }

    await admin.save();
    return { id: admin.id, email: admin.email, displayName: admin.displayName };
  },
};

async function registerFailure(admin: InstanceType<typeof Admin>) {
  admin.failedLoginAttempts = (admin.failedLoginAttempts ?? 0) + 1;
  if (admin.failedLoginAttempts >= env.LOGIN_MAX_ATTEMPTS) {
    admin.lockUntil = new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60 * 1000);
    admin.failedLoginAttempts = 0;
  }
  await admin.save();
}
