import { Certificate } from '../models/Certificate';
import { generateOrderId } from '../utils/idGenerator';
import { ApiError } from '../utils/ApiError';

type CertInput = {
  orderId?: string;
  candidateName: string;
  courseName: string;
  designation: string;
  completionDate: Date;
  expiryDate?: Date | null;
  level?: string;
  rollNumber: string;
  photoUrl?: string | null;
  gender?: string | null;
  institutionName?: string;
  duration?: string;
  status?: string;
  instituteId?: string | null;
};

/** Rows are inserted in chunks so very large CSV imports stay memory-safe. */
const BULK_CHUNK_SIZE = 500;

const normalize = (input: CertInput) => ({
  candidateName: input.candidateName,
  courseName: input.courseName,
  designation: input.designation,
  completionDate: input.completionDate,
  expiryDate: input.expiryDate ?? null,
  level: input.level ?? 'Professional',
  rollNumber: input.rollNumber,
  photoUrl: input.photoUrl ?? null,
  gender: input.gender ?? null,
  institutionName: input.institutionName || 'Jadvix Academy',
  duration: input.duration || 'Not Specified',
  status: input.status ?? 'Completed',
  institute: input.instituteId ? input.instituteId : null,
});

/** Allocate an unused Order ID, retrying on the astronomically rare clash. */
async function uniqueOrderId(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const orderId = generateOrderId();
    if (!(await Certificate.exists({ orderId }))) return orderId;
  }
  throw ApiError.internal('Could not allocate a unique Order ID');
}

/** Ensure a caller-supplied Order ID isn't already taken by another record. */
async function assertOrderIdFree(orderId: string, exceptId?: string) {
  const clash = await Certificate.findOne({ orderId }).select('_id').lean();
  if (clash && String(clash._id) !== exceptId) {
    throw ApiError.conflict(`Order ID ${orderId} is already in use`);
  }
}

export const certificateService = {
  list() {
    // `lean()` returns raw BSON, so the retired certificateCode is excluded explicitly.
    return Certificate.find()
      .select('-__v -certificateCode')
      .sort({ createdAt: -1 })
      .populate('institute')
      .lean();
  },

  async create(input: CertInput) {
    let orderId: string;
    if (input.orderId) {
      await assertOrderIdFree(input.orderId);
      orderId = input.orderId;
    } else {
      orderId = await uniqueOrderId();
    }
    return Certificate.create({ orderId, ...normalize(input) });
  },

  async update(id: string, input: CertInput) {
    const data: Record<string, unknown> = normalize(input);

    // Order ID remains editable (e.g. after a CSV import re-issued it).
    if (input.orderId) {
      await assertOrderIdFree(input.orderId, id);
      data.orderId = input.orderId;
    }

    const updated = await Certificate.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw ApiError.notFound('Certificate not found');
    return updated;
  },

  async remove(id: string) {
    const deleted = await Certificate.findByIdAndDelete(id);
    if (!deleted) throw ApiError.notFound('Certificate not found');
  },

  /**
   * Bulk import. Order IDs are always regenerated so re-importing an export
   * never collides with the originals. Inserted in chunks, unordered so a bad
   * row doesn't abort the whole batch.
   */
  async bulkCreate(rows: CertInput[]) {
    const docs = rows.map((row) => ({ orderId: generateOrderId(), ...normalize(row) }));

    // Guard against the (tiny) chance of a generated ID already existing.
    const generated = docs.map((d) => d.orderId);
    const existing = await Certificate.find({ orderId: { $in: generated } })
      .select('orderId')
      .lean();
    if (existing.length) {
      const taken = new Set(existing.map((e) => e.orderId));
      for (const doc of docs) {
        while (taken.has(doc.orderId)) doc.orderId = generateOrderId();
        taken.add(doc.orderId);
      }
    }

    let inserted = 0;
    for (let i = 0; i < docs.length; i += BULK_CHUNK_SIZE) {
      const chunk = docs.slice(i, i + BULK_CHUNK_SIZE);
      const res = await Certificate.insertMany(chunk, { ordered: false });
      inserted += res.length;
    }
    return inserted;
  },
};
