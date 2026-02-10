import { useState, useCallback, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../services/api';

export function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audio] = useState(new Audio());
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [usingInBrowser, setUsingInBrowser] = useState(false);

    const isCancelledRef = useRef(false);

    // Load Browser Voices (for fallback)
    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            setVoices(allVoices);
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);
    const speakFallback = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const speak = useCallback(async (text: string) => {
        setIsSpeaking(true);
        setIsPaused(false);
        isCancelledRef.current = false;

        const provider = localStorage.getItem('app-tts-provider');

        // Check if we should use Browser TTS (Default or Explicit)
        if (provider !== 'openai') {
            console.log("Using Browser TTS");
            setUsingInBrowser(true);
            speakFallback(text);
            return;
        }

        // Use Cloud TTS (OpenAI)
        console.log("Using Cloud TTS");
        setUsingInBrowser(false);

        // Cancel previous
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }

        try {
            // Simple chunking logic (restored for cloud)
            const maxLength = 200;
            const chunks: string[] = [];
            const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
            let currentChunk = "";
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length > maxLength) {
                    if (currentChunk) chunks.push(currentChunk.trim());
                    currentChunk = sentence;
                } else {
                    currentChunk += sentence;
                }
            }
            if (currentChunk.trim()) chunks.push(currentChunk.trim());

            for (const chunk of chunks) {
                if (isCancelledRef.current) break;
                if (!chunk.trim()) continue;

                const response = await fetch(`${API_BASE_URL}/api/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: chunk }),
                });

                if (isCancelledRef.current) break;

                if (!response.ok) throw new Error("TTS API Error");

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                if (isCancelledRef.current) {
                    URL.revokeObjectURL(url);
                    break;
                }

                audio.src = url;
                await new Promise((resolve) => {
                    audio.onended = resolve;
                    if (!isCancelledRef.current) {
                        audio.play().catch(e => {
                            console.error("Playback error", e);
                            resolve(null);
                        });
                    } else {
                        resolve(null);
                    }
                });
                URL.revokeObjectURL(url);
            }

            setIsSpeaking(false);

        } catch (error) {
            console.warn("Cloud TTS failed, falling back to browser", error);
            setUsingInBrowser(true);
            speakFallback(text);
        }
    }, [audio, speakFallback]);



    const stop = useCallback(() => {
        isCancelledRef.current = true;
        audio.pause();
        audio.currentTime = 0;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, [audio]);

    const togglePlay = useCallback(() => {
        if (isSpeaking) {
            if (isPaused) {
                audio.play();
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                audio.pause();
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
        }
    }, [audio, isSpeaking, isPaused]);

    return { speak, stop, togglePlay, isSpeaking, isPaused, voices, usingFallback: usingInBrowser };
}
