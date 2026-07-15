import { Router } from 'express';
import {
  createMealPlan,
  deleteMealPlan,
  getMealPlan,
  listMealPlans,
  updateMealPlan,
} from '../controllers/mealPlanController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mealPlanSchema } from '../utils/validators.js';

const router = Router();
router.use(protect);
router.get('/', listMealPlans);
router.get('/:id', getMealPlan);
router.post('/', authorize('dietitian', 'admin'), validate(mealPlanSchema), createMealPlan);
router.put('/:id', authorize('dietitian', 'admin'), validate(mealPlanSchema), updateMealPlan);
router.delete('/:id', authorize('dietitian', 'admin'), deleteMealPlan);
export default router;
