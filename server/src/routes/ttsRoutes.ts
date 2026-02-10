import { Router } from 'express';
import { speakText } from '../controllers/ttsController';

const router = Router();

router.post('/', speakText);

export default router;
