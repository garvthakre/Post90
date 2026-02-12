import { Router } from 'express';
import { generate } from '../controllers/generateController.js';

const router = Router();

router.post('/', generate);

export default router;