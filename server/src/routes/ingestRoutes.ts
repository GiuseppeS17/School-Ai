import { Router } from 'express';
import multer from 'multer';
import { ingestFile } from '../controllers/ingestController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint per caricare documenti
// Accetta campo 'file' nel form-data
router.post('/upload', upload.single('file'), ingestFile);

export default router;
