import { Router } from 'express';
import { RecommendController } from '../controllers/recommend.controller';

const router = Router();

// Public routes - no authentication required
router.post('/recommendations', RecommendController.getRecommendations);
router.get('/menu/today', RecommendController.getTodaysMenuData);

export default router;