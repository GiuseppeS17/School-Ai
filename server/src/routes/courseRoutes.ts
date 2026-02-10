import { Router } from 'express';
import { getCourses, getCourseById, deleteCourse } from '../controllers/courseController';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.delete('/:id', deleteCourse);

export default router;
