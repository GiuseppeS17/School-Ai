import { Router } from 'express';
import { generateLesson, updateLessonContent } from '../controllers/lessonController';

const router = Router();

router.post('/generate', generateLesson);
router.put('/update', updateLessonContent);

export default router;
