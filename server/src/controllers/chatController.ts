import { Request, Response } from 'express';
// @ts-ignore
import { getEmbedding, getChatCompletion } from '../services/openaiService';
// @ts-ignore
import { VectorStore } from '../services/vectorStore';

export const healthCheck = (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const chatEncoded = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        console.log('Received message:', message);

        // 1. Get embedding for the user Question
        const questionEmbedding = await getEmbedding(message);

        // 2. Search for relevant context
        const relevantDocs = await VectorStore.search(questionEmbedding, 3);

        let contextText = "";
        let sources = [];

        if (relevantDocs.length > 0) {
            contextText = relevantDocs.map((doc: any) => doc.text).join("\n---\n");
            sources = relevantDocs.map((doc: any) => doc.source);
            console.log("Found context from:", sources);
        } else {
            console.log("No relevant context found.");
        }

        // 3. Construct System Prompt with Context
        const systemMessage = {
            role: "system",
            content: `Sei un assistente scolastico intelligente. Usa il seguente CONTESTO per rispondere alla domanda dell'utente.
            Se la risposta non è nel contesto, prova a rispondere usando le tue conoscenze generali ma avvisa che non è nel materiale caricato.
            
            CONTESTO:
            ${contextText}
            `
        };

        const userMessage = {
            role: "user",
            content: message
        };

        // 4. Call OpenAI
        const responseText = await getChatCompletion([systemMessage, userMessage]);

        res.json({
            response: responseText,
            sources: [...new Set(sources)] // Unique sources
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
