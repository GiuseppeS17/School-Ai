import { Router } from 'express';
import { chatEncoded, healthCheck } from '../controllers/chatController';

const router = Router();

router.get('/health', healthCheck);
router.post('/chat', chatEncoded);

export default router;
