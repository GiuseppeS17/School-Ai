import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import ingestRoutes from './routes/ingestRoutes';
import ttsRoutes from './routes/ttsRoutes';
import courseRoutes from './routes/courseRoutes';
import testRoutes from './routes/testRoutes';
import lessonRoutes from './routes/lessonRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/lessons', lessonRoutes);

// Root Mock
app.get('/', (req, res) => {
    res.send('School AI Backend API is running');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
