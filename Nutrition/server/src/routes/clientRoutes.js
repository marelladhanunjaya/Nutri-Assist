import { Router } from 'express';
import {
  createClient,
  deleteClient,
  getClient,
  getMyClient,
  listClients,
  listUnassignedUsers,
  updateClient,
} from '../controllers/clientController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { clientSchema } from '../utils/validators.js';

const router = Router();
router.use(protect);
router.get('/', listClients);
router.get('/mine', authorize('user'), getMyClient);
router.get('/unassigned-users', authorize('dietitian', 'admin'), listUnassignedUsers);
router.get('/:id', getClient);
router.post('/', authorize('dietitian', 'admin'), validate(clientSchema), createClient);
router.put('/:id', authorize('dietitian', 'admin'), validate(clientSchema), updateClient);
router.delete('/:id', authorize('dietitian', 'admin'), deleteClient);
export default router;
