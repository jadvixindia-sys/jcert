import { Institute } from '../models/Institute';
import { ApiError } from '../utils/ApiError';

type InstituteInput = {
  name: string;
  address: string;
  logo?: string | null;
  trainerName?: string | null;
  founderName?: string | null;
};

const normalize = (input: InstituteInput) => ({
  name: input.name,
  address: input.address,
  logo: input.logo || null,
  trainerName: input.trainerName || null,
  founderName: input.founderName || null,
});

export const instituteService = {
  list() {
    return Institute.find().sort({ createdAt: -1 }).lean();
  },

  create(input: InstituteInput) {
    return Institute.create(normalize(input));
  },

  async update(id: string, input: InstituteInput) {
    const updated = await Institute.findByIdAndUpdate(id, normalize(input), {
      new: true,
      runValidators: true,
    });
    if (!updated) throw ApiError.notFound('Institute not found');
    return updated;
  },

  async remove(id: string) {
    const deleted = await Institute.findByIdAndDelete(id);
    if (!deleted) throw ApiError.notFound('Institute not found');
  },
};
