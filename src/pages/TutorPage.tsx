import { useState, useEffect, useRef } from 'react';
import { Avatar } from '../components/Avatar';
import { useTranslation } from 'react-i18next';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { sendChatMessage } from '../services/api';
import { Mic, Send, VolumeX, Play, Pause } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export function TutorPage() {
    const { t } = useTranslation();
    const { isListening, transcript, startListening, stopListening, error: micError } = useSpeechRecognition();
    const { speak, stop, togglePlay, isSpeaking, isPaused, usingFallback } = useTextToSpeech();

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Ciao! Sono il tuo Tutor AI. Come posso aiutarti oggi?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<string | null>(null);

    // Stop speech on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    // Sync transcript to input - Append mode for continuous listening
    useEffect(() => {
        if (transcript) {
            setInputValue(transcript);
        }
    }, [transcript]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Stop listening when sending to reset state/buffer
        if (isListening) stopListening();

        setError(null);

        const userMsg: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Call Real Backend
        try {
            const data = await sendChatMessage(userMsg.text);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);

            await speak(data.response);
        } catch (e) {
            console.error("Chat error:", e);
            setError("Errore di connessione col cervello dell'AI.");
            const errorMsg: Message = { id: Date.now().toString(), text: "Scusa, ho avuto un problema a collegarmi.", sender: 'ai' };
            setMessages(prev => [...prev, errorMsg]);
        }
    };



    return (
        <div className="max-w-6xl mx-auto pt-4 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
            <header className="mb-6 flex justify-between items-center bg-background py-2 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight">{t('card_tutor_title')}</h1>
                    <p className="text-text-muted">{t('card_tutor_desc')}</p>
                </div>
                {/* ... button ... */}
                <button
                    onClick={isSpeaking ? togglePlay : undefined}
                    disabled={!isSpeaking}
                    className={`p-2 rounded-full transition-all ${isSpeaking ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    title={isSpeaking ? (isPaused ? "Resume Audio" : "Pause Audio") : "No Audio Playing"}
                >
                    {isSpeaking && !isPaused ? <Pause size={20} /> : (isSpeaking && isPaused ? <Play size={20} /> : <VolumeX size={20} />)}
                </button>
            </header>

            {/* Mic Error Banner (Network etc) */}
            {micError && (
                <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-2 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2 shrink-0">
                    🚫 {micError}
                </div>
            )}

            {usingFallback && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg mb-4 text-sm text-center shrink-0">
                    ⚠️ OpenAI Credit empty? Switching to <b>Device Voice</b> (Free Mode).
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm text-center shrink-0">
                    {error}
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 min-h-0">
                {/* Avatar Area */}
                <div className="lg:col-span-2 flex flex-col relative min-h-0 overflow-hidden">
                    <Avatar />
                    {/* Visual Indicator for Speaking */}
                    {isSpeaking && (
                        <div className="absolute top-4 right-4 bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
                            🗣️ Speaking...
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="bg-surface rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-primary/10 text-primary rounded-tr-none font-medium' : 'bg-background border border-primary/5 text-text-main rounded-tl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    {/* Input Area */}
                    <div className="relative flex items-end gap-2">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-3 rounded-xl transition-all duration-300 mb-1 ${isListening
                                ? 'bg-red-500 text-white shadow-lg ring-4 ring-red-200 animate-pulse'
                                : 'bg-surface border border-primary/10 text-text-muted hover:bg-primary/5'
                                }`}
                            title={isListening ? "Stop Listening" : "Start Listening"}
                        >
                            <Mic size={20} className={isListening ? "animate-bounce" : ""} />
                        </button>

                        <div className="relative flex-1">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={isListening ? "Listening..." : "Type a message..."}
                                rows={3}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm text-text-main placeholder:text-text-muted resize-none custom-scrollbar min-h-[80px] max-h-[160px] ${isListening
                                    ? 'bg-red-50 border-red-200 focus:ring-red-200 placeholder:text-red-400'
                                    : 'bg-surface border-primary/10 focus:ring-primary/20'
                                    }`}
                            />
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-1 shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
