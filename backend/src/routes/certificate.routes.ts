import { Router } from 'express';
import { certificateController } from '../controllers/certificate.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  bulkCertificateSchema,
  certificateIdSchema,
  createCertificateSchema,
  updateCertificateSchema,
} from '../validators';

const router = Router();

// All certificate management routes require an authenticated admin.
router.use(requireAuth);

router.get('/', certificateController.list);
router.post('/', validate(createCertificateSchema), certificateController.create);
router.post('/bulk', validate(bulkCertificateSchema), certificateController.bulk);
router.put('/:id', validate(updateCertificateSchema), certificateController.update);
router.delete('/:id', validate(certificateIdSchema), certificateController.remove);

export default router;
