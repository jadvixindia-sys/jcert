import { Certificate } from '../models/Certificate';
import { ApiError } from '../utils/ApiError';

/**
 * Public lookup by Order ID. Returns a lean, projected view — never exposes
 * internal Mongo fields beyond what the verification card needs.
 */
export const verifyService = {
  async byOrderId(orderId: string) {
    const cert = await Certificate.findOne({ orderId })
      .populate('institute', 'name address logo trainerName founderName')
      // `lean()` returns raw BSON, so the retired certificateCode is excluded explicitly.
      .select('-__v -certificateCode')
      .lean();

    if (!cert) throw ApiError.notFound('No certificate found with this Order ID');
    return cert;
  },
};
