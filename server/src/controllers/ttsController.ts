import { Request, Response } from 'express';
import { openai } from '../services/openaiService';

export const speakText = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`Generating speech for: "${text.substring(0, 20)}..."`);

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy", // Changed from nova to alloy for better neutrality
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
        });

        res.send(buffer);

    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'TTS Generation Failed' });
    }
};
