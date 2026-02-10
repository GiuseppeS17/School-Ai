import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { getEmbedding, getChatCompletion } from '../services/openaiService';
import { VectorStore } from '../services/vectorStore';

export const generateLesson = async (req: Request, res: Response) => {
    const { courseId, chapterTitle, forceRegenerate } = req.body;
    console.log(`[LessonGen] START for "${chapterTitle}" (Course: ${courseId}) - Force: ${forceRegenerate}`);

    // 1. Validation without crashing
    if (!courseId || !chapterTitle) {
        return res.status(400).json({ error: "courseId and chapterTitle are required" });
    }

    try {
        // 0. Check for existing lesson
        if (!forceRegenerate) {
            const existingLesson = db.getLesson(courseId, chapterTitle);
            if (existingLesson) {
                console.log("[LessonGen] Found existing lesson. Returning cached version.");
                return res.json({
                    title: existingLesson.title,
                    content: existingLesson.content,
                    generatedAt: existingLesson.generatedAt
                });
            }
        }

        // 2. RAG Context Retrieval (Safe Mode)
        let context = "";
        try {
            console.log("[LessonGen] Step 1: Fetching Context...");
            const searchEmbedding = await getEmbedding(chapterTitle);
            const searchResults = await VectorStore.search(searchEmbedding, 8); // Reduced limit for speed/safety
            if (searchResults && searchResults.length > 0) {
                context = searchResults.map(r => r.text).join('\n\n');
                console.log(`[LessonGen] Found ${searchResults.length} context chunks.`);
            } else {
                console.log("[LessonGen] No context found. Continuing safe.");
            }
        } catch (ragError: any) {
            console.warn("[LessonGen] RAG Warning (ignoring):", ragError.message);
            // Proceed without context - DO NOT THROW
        }

        // 3. AI Generation (Safe Mode)
        let lessonContent = "";
        try {
            console.log("[LessonGen] Step 2: Calling AI...");

            const systemPrompt = `You are a distinguished University Professor and expert pedagogue. Your goal is to deliver a comprehensive, master-class level lesson on the topic.

            Write an **ENGAGING**, interactive, and **DEEPLY EXPLANATORY** lesson about "${chapterTitle}".

            **Critical Instruction**: Do NOT just list concepts. Explain them. CONNECT the dots.
            - **Avoid "Listicle" style** BUT ensure readability.
            - **Logical Separation**: COMPLETELY AVOID walls of text. If you discuss two different topics (e.g. Mannerism and Baroque), use separate paragraphs or sub-headers (###) to clearly distinguish them.
            - **Readable Paragraphs**: Keep paragraphs visually distinct. Do not merge unrelated ideas into one block.
            - Use bullet points *only* for fast facts or standard lists, but the core teaching must be narrative.

            **Structural Requirements**:
            1. **Title & Introduction**: Hook the student immediately.
            2. **Core Concepts (Deep Dive)**: 
               - Explain the "Why" and "How" in detail. 
               - Use sub-headings (###) to separate major sub-concepts.
               - Use analogies to make abstract concepts concrete.
               - Don't just say "X is important". Explain *why* it drives the system.
            3. **Advanced Analysis**: Discuss implications, nuances, or common misconceptions.
            4. **Real-World Case Study**: Provide a detailed scenario/story, not just a one-line example.
            5. **Critical Thinking**: Pose a challenging question to the student to make them think.
            6. **Summary**: Brief recap.

            **Formatting & Style Guide**:
            - **Use Emojis**: Use relevant emojis **SPARINGLY** and only where strictly relevant (e.g., major section headers).
            - **Blockquotes**: Use blockquotes (>) for definitions or very important "Remember" notes.
            - **Dividers**: Use horizontal rules (---) to visually separate major sections.
            - **Tone**: Professional, authoritative, yet inspiring and energetic.

            Base your lesson on the provided context, but expand upon it significantly with your expert knowledge.`;

            const userPrompt = context
                ? `Context from the course material:\n${context}\n\nPlease generate the full master-class lesson for: ${chapterTitle}`
                : `Please generate the full master-class lesson for: ${chapterTitle}. No specific context provided, so rely on your general expert knowledge.`;

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ];

            // Only make the expensive call if we have keys
            if (process.env.OPENAI_API_KEY) {
                lessonContent = await getChatCompletion(messages) || "";
            } else {
                lessonContent = "Error: API Key missing. Please check server logs.";
            }

        } catch (aiError: any) {
            console.error("[LessonGen] AI Error:", aiError.message);
            // Fallback content if AI fails (e.g., timeout, rate limit)
            lessonContent = `
# ${chapterTitle}

*Automatic Fallback Lesson*

We encountered a temporary issue generating the custom lesson content. However, here is what you should know about **${chapterTitle}**:

1.  This is a key concept in the course.
2.  Please refer to the source PDF for full details while we fix the AI connection.
3.  Error details: ${aiError.message}
            `.trim();
        }

        // 4. Save and Return
        const newLesson = {
            id: uuidv4(),
            courseId,
            chapterTitle,
            title: chapterTitle,
            content: lessonContent || "## Content Generation Failed\n\nPlease try again later.",
            generatedAt: new Date().toISOString()
        };

        db.addLesson(newLesson);
        console.log("[LessonGen] Success. Saved to DB and sending response.");

        return res.json({
            title: newLesson.title,
            content: newLesson.content,
            generatedAt: newLesson.generatedAt
        });

    } catch (criticalError: any) {
        // This catches only unexpected logic errors in *this* file
        console.error("[LessonGen] CRITICAL:", criticalError);
        return res.status(500).json({ error: "Internal Generation Error. See logs." });
    }
};
