import { Certificate } from '../models/Certificate';
import { Institute } from '../models/Institute';

export const dashboardService = {
  async stats() {
    const [totalCertificates, totalInstitutions, pendingCertificates, completedCertificates] =
      await Promise.all([
        Certificate.estimatedDocumentCount(),
        Institute.estimatedDocumentCount(),
        Certificate.countDocuments({ status: 'On Process' }),
        Certificate.countDocuments({ status: 'Completed' }),
      ]);

    return { totalCertificates, totalInstitutions, pendingCertificates, completedCertificates };
  },
};
