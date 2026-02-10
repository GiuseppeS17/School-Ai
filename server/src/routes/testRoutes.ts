import { Router } from 'express';
import { generateTest } from '../controllers/testController';

const router = Router();

router.post('/generate', generateTest);

export default router;
