import { useState, useEffect, useCallback } from 'react';

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Clear error when starting new session
        setError(null);

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'it-IT';

            rec.onstart = () => {
                console.log("Mic started");
                setIsListening(true);
                setError(null);
            };
            rec.onend = () => {
                console.log("Mic stopped");
                setIsListening(false);
            };
            rec.onerror = (event: any) => {
                console.error("Mic Error:", event.error);
                if (event.error === 'network') {
                    setError("Errore di Rete: Controlla la connessione internet.");
                } else if (event.error === 'not-allowed') {
                    setError("Permesso Negato: Abilita il microfono nel browser.");
                } else if (event.error === 'no-speech') {
                    // Ignore no-speech, it just means silence
                } else {
                    setError(`Errore Mic: ${event.error}`);
                }
                setIsListening(false);
            };
            rec.onresult = (event: any) => {
                const finalTranscript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');
                setTranscript(finalTranscript);
            };

            setRecognition(rec);
        } else {
            console.warn("Browser does not support Speech Recognition");
            setError("Browser non supportato per la voce.");
        }
    }, []);

    // ... (start/stop methods remain same)

    const startListening = useCallback(() => {
        if (recognition) {
            try {
                recognition.start();
                setError(null);
            } catch (e) {
                console.error("Start error", e);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    return { isListening, transcript, startListening, stopListening, hasRecognition: !!recognition, error };
}
