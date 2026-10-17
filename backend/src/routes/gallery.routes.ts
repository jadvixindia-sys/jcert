import { Router } from 'express';
import { galleryController } from '../controllers/gallery.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadImage } from '../middleware/upload';
import { galleryIdSchema } from '../validators';

const router = Router();
router.use(requireAuth);

router.get('/', galleryController.list);
router.post('/', uploadImage, galleryController.upload);
router.delete('/:id', validate(galleryIdSchema), galleryController.remove);

export default router;
