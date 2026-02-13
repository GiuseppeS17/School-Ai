import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { getEmbedding, getChatCompletionStream } from '../services/openaiService';
import { VectorStore } from '../services/vectorStore';

const DATA_DIR = path.join(__dirname, '../../data');
const NOTES_DIR = path.join(DATA_DIR, 'My notes');

// Ensure notes directory exists
if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
}

const getNoteFilePath = (courseId: string, chapterTitle: string) => {
    // Sanitize to be safe for filenames
    const safeTitle = chapterTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeCourse = courseId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return path.join(NOTES_DIR, `${safeCourse}_${safeTitle}.txt`);
};

export const generateLesson = async (req: Request, res: Response) => {
    const { courseId, chapterTitle, forceRegenerate } = req.body;
    console.log(`[LessonGen] START for "${chapterTitle}" (Course: ${courseId}) - Force: ${forceRegenerate}`);

    if (!courseId || !chapterTitle) {
        return res.status(400).json({ error: "courseId and chapterTitle are required" });
    }

    // 0. Check for existing lesson (unless forced)
    if (!forceRegenerate) {
        const existingLesson = db.getLesson(courseId, chapterTitle);
        if (existingLesson) {
            const notePath = getNoteFilePath(courseId, chapterTitle);
            let fileNotes = "";
            if (fs.existsSync(notePath)) {
                try {
                    fileNotes = fs.readFileSync(notePath, 'utf-8');
                } catch (e) {
                    console.error("[LessonGen] Failed to read note file:", e);
                }
            }

            console.log("[LessonGen] Found existing lesson. Returning cached version with file notes.");
            return res.json({
                title: existingLesson.title,
                content: existingLesson.content,
                notes: fileNotes || existingLesson.notes, // Prioritize file notes
                generatedAt: existingLesson.generatedAt,
                cached: true
            });
        }
    }

    // Stream Setup
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullContent = "";

    try {
        // 1. RAG Context Retrieval
        let context = "";
        try {
            console.log("[LessonGen] Fetching Context...");
            const searchEmbedding = await getEmbedding(chapterTitle);
            const searchResults = await VectorStore.search(searchEmbedding, 5); // 5 chunks is a good balance
            if (searchResults && searchResults.length > 0) {
                context = searchResults.map(r => r.text).join('\n\n');
                console.log(`[LessonGen] Context: ${searchResults.length} chunks.`);
            }
        } catch (ragError: any) {
            console.warn("[LessonGen] RAG Warning:", ragError.message);
        }

        // 2. AI Prompt
        const systemPrompt = `You are a distinguished University Professor. 
        Write an ENGAGING, deeply explanatory master-class lesson about "${chapterTitle}".
        
        Guidance:
        - Use clear paragraphs.
        - Use # and ## for headers.
        - Connect concepts logically.
        - Explain "Why" and "How".
        - Be authoritative but inspiring.
        
        Total length should be comprehensive (approx 1000-1500 words).`;

        const userPrompt = context
            ? `Context:\n${context}\n\nGenerate the full lesson for: ${chapterTitle}`
            : `Generate the full lesson for: ${chapterTitle}`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];

        // 3. Streaming Generation
        if (!process.env.OPENAI_API_KEY) {
            res.write("Error: API Key missing.");
            res.end();
            return;
        }

        console.log("[LessonGen] Starting Stream...");
        const stream = await getChatCompletionStream(messages);

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(content);
                fullContent += content;
            }
        }

        // 4. Save *after* success
        const newLesson = {
            id: uuidv4(),
            courseId,
            chapterTitle,
            title: chapterTitle,
            content: fullContent,
            generatedAt: new Date().toISOString()
        };
        db.addLesson(newLesson);
        console.log(`[LessonGen] Completed. Length: ${fullContent.length}`);

        res.end();

    } catch (error: any) {
        console.error("[LessonGen] Critical Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.write("\n\n[ERROR: Generation failed mid-stream]");
            res.end();
        }
    }
};

export const updateLessonContent = async (req: Request, res: Response) => {
    const { courseId, chapterTitle, content, notes, cloudNotes } = req.body;

    if (!courseId || !chapterTitle) {
        return res.status(400).json({ error: "Missing required fields: courseId, chapterTitle" });
    }

    try {
        const updatedLesson = db.updateLesson(courseId, chapterTitle, content, notes, cloudNotes);

        if (!updatedLesson) {
            return res.status(404).json({ error: "Lesson not found to update." });
        }

        // File-based Note Saving
        if (notes !== undefined) {
            try {
                const notePath = getNoteFilePath(courseId, chapterTitle);
                fs.writeFileSync(notePath, notes, 'utf-8');
                console.log(`[LessonUpdate] Saved notes to file: ${notePath}`);
            } catch (e) {
                console.error("[LessonUpdate] Failed to write note file:", e);
            }
        }

        console.log(`[LessonUpdate] Updated lesson/notes for "${chapterTitle}"`);
        return res.json({ ...updatedLesson, notes }); // Return the updated notes content

    } catch (error: any) {
        console.error("[LessonUpdate] Error:", error);
        return res.status(500).json({ error: "Failed to update lesson." });
    }
};
