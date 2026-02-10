import { Router } from 'express';
import { generateLesson } from '../controllers/lessonController';

const router = Router();

router.post('/generate', generateLesson);

export default router;
