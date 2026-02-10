import { Request, Response } from 'express';
import { db } from '../services/db';
import { getEmbedding, getChatCompletion } from '../services/openaiService';
import { VectorStore } from '../services/vectorStore';
import { v4 as uuidv4 } from 'uuid';

export const generateTest = async (req: Request, res: Response) => {
    try {
        const { courseId, chapterTitle, difficulty = 'medium' } = req.body;

        // Validation: courseId is mandatory, chapterTitle is now optional (for general tests)
        if (!courseId) {
            return res.status(400).json({ error: "courseId is required" });
        }

        const isGeneralTest = !chapterTitle || chapterTitle === 'GENERAL';
        const targetTitle = isGeneralTest ? "General Knowledge" : chapterTitle;

        console.log(`Generating test for: ${targetTitle} (Course: ${courseId})`);

        // 1. Get Context via RAG
        let context = "";
        try {
            // If General Test: Search for course-wide concepts
            // If Chapter Test: Search for specific chapter content
            const query = isGeneralTest
                ? "Important concepts overview summary"
                : chapterTitle;

            const searchEmbedding = await getEmbedding(query);
            // Increase chunks to get more diversity for 10 questions
            const limit = isGeneralTest ? 15 : 10;
            const searchResults = await VectorStore.search(searchEmbedding, limit);

            context = searchResults.map(r => r.text).join('\n\n');
        } catch (err) {
            console.warn("RAG failed, proceeding with generic AI generation");
        }

        // 2. Generate Quiz via LLM
        const prompt = [
            {
                role: "system",
                content: `You are a strict teacher. Create a multiple-choice test based ONLY on the provided context.
                
                Generate **10 questions**.
                For each question provide:
                - "id": unique id
                - "text": The question text
                - "options": Array of 4 strings
                - "correctAnswer": The index (0-3) of the correct option
                
                Return specific JSON format: { "title": "Test on ${targetTitle}", "questions": [...] }`
            },
            {
                role: "user",
                content: `Context:\n${context}\n\nDifficulty: ${difficulty}\n\nGenerate JSON:`
            }
        ];

        // We need a way to get JSON output cleanly. openaiService currently returns string.
        // We'll parse it.
        const responseStr = await getChatCompletion(prompt);
        let quizData;

        try {
            // Sanitize markdown code blocks if present
            const cleanJson = responseStr?.replace(/^```json/, '').replace(/```$/, '').trim() || "{}";
            quizData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse LLM JSON", responseStr);
            throw new Error("AI failed to generate valid JSON test");
        }

        const testId = uuidv4();
        const test = {
            id: testId,
            courseId,
            chapterTitle,
            questions: quizData.questions,
            createdAt: new Date().toISOString()
        };

        // Optionally save to DB if we want history
        // db.addTest(test); 

        res.json(test);

    } catch (error) {
        console.error("Test generation error:", error);
        res.status(500).json({ error: "Failed to generate test" });
    }
};
