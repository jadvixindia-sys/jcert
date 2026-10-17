import { z } from 'zod';
import { CERTIFICATE_LEVELS, CERTIFICATE_STATUSES, GENDERS } from '../models/Certificate';

/** Reusable trimmed non-empty string. */
const nonEmpty = (label: string, max = 300) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

/** Optional free-text that treats '' as "not provided". */
const optionalText = (max = 300) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

/** Public Order ID, e.g. JX-AB12-CD34. */
const orderIdField = z
  .string()
  .trim()
  .toUpperCase()
  .min(3)
  .max(40)
  .regex(/^[A-Z0-9-]+$/, 'Order ID may only contain letters, numbers and hyphens');

// ── Auth ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Valid email required'),
    password: z.string().min(1, 'Password required').max(200),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      displayName: z.string().trim().min(1).max(120).optional(),
      oldPassword: z.string().max(200).optional(),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .max(200)
        .optional(),
    })
    .refine((d) => !d.newPassword || !!d.oldPassword, {
      message: 'Current password is required to set a new password',
      path: ['oldPassword'],
    }),
});

// ── Certificate ─────────────────────────────────────────────────────────────
const certificateBody = z.object({
  candidateName: nonEmpty('Candidate name'),
  courseName: nonEmpty('Course name'),
  designation: nonEmpty('Designation'),
  completionDate: z.coerce.date({ errorMap: () => ({ message: 'Valid completion date required' }) }),
  // Optional expiry — blank/null means the credential never expires.
  expiryDate: z
    .union([z.coerce.date(), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v instanceof Date ? v : null)),
  level: z.enum(CERTIFICATE_LEVELS).default('Professional'),
  rollNumber: nonEmpty('Roll number', 100),
  photoUrl: optionalText(2000),
  gender: z
    .union([z.enum(GENDERS), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  institutionName: z.string().trim().max(300).optional(),
  duration: z.string().trim().max(100).optional(),
  status: z.enum(CERTIFICATE_STATUSES).default('Completed'),
  instituteId: z.union([objectId, z.literal(''), z.null()]).optional(),
});

export const createCertificateSchema = z.object({
  // Order ID is optional on create — generated when omitted.
  body: certificateBody.extend({ orderId: orderIdField.optional() }),
});

export const updateCertificateSchema = z.object({
  params: z.object({ id: objectId }),
  // Order ID stays editable after an import.
  body: certificateBody.extend({ orderId: orderIdField.optional() }),
});

export const certificateIdSchema = z.object({ params: z.object({ id: objectId }) });

export const bulkCertificateSchema = z.object({
  body: z.object({
    // No practical row cap — large imports are inserted in batches.
    certificates: z.array(certificateBody.partial({ status: true, level: true })).min(1),
  }),
});

// ── Verify (public) ─────────────────────────────────────────────────────────
export const verifySchema = z.object({
  params: z.object({ orderId: orderIdField }),
});

// ── Institute ───────────────────────────────────────────────────────────────
const instituteBody = z.object({
  name: nonEmpty('Institute name'),
  address: nonEmpty('Address'),
  logo: optionalText(2000),
  trainerName: optionalText(200),
  founderName: optionalText(200),
});
export const createInstituteSchema = z.object({ body: instituteBody });
export const updateInstituteSchema = z.object({
  params: z.object({ id: objectId }),
  body: instituteBody,
});
export const instituteIdSchema = z.object({ params: z.object({ id: objectId }) });

// ── Gallery ─────────────────────────────────────────────────────────────────
export const galleryIdSchema = z.object({ params: z.object({ id: objectId }) });

// ── Site settings ───────────────────────────────────────────────────────────
export const siteSettingsSchema = z.object({
  body: z.object({
    headerLogoUrl: z.string().trim().max(2000).nullish(),
    faviconUrl: z.string().trim().max(2000).nullish(),
    ukrlpLogoUrl: z.string().trim().max(2000).nullish(),
    footerLogoUrl: z.string().trim().max(2000).nullish(),
    footerText: z.string().trim().max(1000).nullish(),
  }),
});
