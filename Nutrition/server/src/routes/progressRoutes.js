import { Router } from 'express';
import {
  createProgress,
  deleteProgress,
  listProgress,
  updateProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { progressSchema } from '../utils/validators.js';

const router = Router();
router.use(protect);
router.get('/', listProgress);
router.post('/', validate(progressSchema), createProgress);
router.put('/:id', validate(progressSchema), updateProgress);
router.delete('/:id', deleteProgress);
export default router;
