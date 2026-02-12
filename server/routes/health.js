import { Router } from 'express';
import { health, validateUsername } from '../controllers/healthController.js';

const router = Router();

router.get('/health', health);
router.get('/validate-username', validateUsername);

export default router;