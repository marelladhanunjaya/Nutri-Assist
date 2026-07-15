import { Router } from 'express';
import { dashboard, listUsers, updateUser } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userUpdateSchema } from '../utils/validators.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.patch('/users/:id', validate(userUpdateSchema), updateUser);
export default router;
