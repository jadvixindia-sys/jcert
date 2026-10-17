import { Router } from 'express';
import { instituteController } from '../controllers/institute.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createInstituteSchema, instituteIdSchema, updateInstituteSchema } from '../validators';

const router = Router();
router.use(requireAuth);

router.get('/', instituteController.list);
router.post('/', validate(createInstituteSchema), instituteController.create);
router.put('/:id', validate(updateInstituteSchema), instituteController.update);
router.delete('/:id', validate(instituteIdSchema), instituteController.remove);

export default router;
