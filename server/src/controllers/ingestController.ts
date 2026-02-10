import { Request, Response } from 'express';
import { processDocument, splitTextIntoChunks } from '../services/documentProcessor';
import { getEmbeddings, generateCourseOutline } from '../services/openaiService';
import { VectorStore } from '../services/vectorStore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';

export const ingestText = async (req: Request, res: Response) => {
    res.status(501).json({ message: "Use /upload for files" });
};

export const ingestFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);

        // 1. Extract text
        const text = await processDocument(req.file.buffer, req.file.mimetype);

        // 2. Generate Structure (Outline) for Navigation
        // Use a smaller chunk for outline generation to be fast
        const previewText = text.substring(0, 15000);
        console.log("Generating Outline...");
        const outline = await generateCourseOutline(previewText);

        const courseId = uuidv4();

        // 3. Save Course Metadata
        const newCourse = {
            id: courseId,
            title: outline.title || req.file.originalname,
            description: `Generated from ${req.file.originalname}`,
            sourceFile: req.file.originalname,
            chapters: outline.chapters, // Just the titles/context
            createdAt: new Date().toISOString()
        };

        db.addCourse(newCourse);
        console.log(`Course created: ${newCourse.title}`);

        // 4. Chunking & Embedding (The Core of RAG)
        const chunks = splitTextIntoChunks(text, 1000, 100);
        console.log(`Generated ${chunks.length} chunks.`);

        const documentsToAdd = [];
        const BATCH_SIZE = 20;

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batchChunks = chunks.slice(i, i + BATCH_SIZE);
            console.log(`Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);

            try {
                const embeddings = await getEmbeddings(batchChunks);
                for (let j = 0; j < batchChunks.length; j++) {
                    documentsToAdd.push({
                        id: uuidv4(),
                        text: batchChunks[j],
                        source: req.file.originalname,
                        embedding: embeddings[j]
                    });
                }
            } catch (err) {
                console.error(`Error processing batch:`, err);
                // Continue to try other batches
            }
        }

        // 5. Save to Vector Store
        await VectorStore.addDocuments(documentsToAdd);

        res.json({
            message: 'File processed successfully',
            chunks: chunks.length,
            course: newCourse
        });

    } catch (error: any) {
        console.error('Ingest error:', error);
        res.status(500).json({ error: error.message || 'Internal processing error' });
    }
};
