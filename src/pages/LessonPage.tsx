import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateLesson, sendChatMessage, type Lesson } from '../services/api';
import { ArrowLeft, Loader2, Play, Pause, Send, Bot, RefreshCw } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Avatar } from '../components/Avatar';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export function LessonPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseId, chapterTitle } = location.state || {};

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null); // Use React.useRef since we didn't import useRef explicitly at top or change imports

    // Audio
    const { speak, togglePlay, isSpeaking, isPaused, stop } = useTextToSpeech();

    useEffect(() => {
        if (!courseId || !chapterTitle) {
            navigate('/academy');
            return;
        }
        loadLesson();
    }, [courseId, chapterTitle]);

    // Cleanup
    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    const loadLesson = async (force: boolean = false) => {
        try {
            setLoading(true);
            const data = await generateLesson(courseId, chapterTitle, force);
            setLesson(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load lesson.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !lesson) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), text: chatInput, sender: 'user' };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const prompt = `Context: The user is studying a lesson about "${lesson.title}".
            Lesson Content: ${lesson.content.substring(0, 5000)}... (truncated)
            
            User Question: ${userMsg.text}
            
            Answer strictly based on the lesson context provided above. Keep it concise.`;

            const data = await sendChatMessage(prompt);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: 'ai'
            };
            setChatMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            console.error("Chat error", e);
            setChatMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, I couldn't answer that.", sender: 'ai' }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Generating Lesson...</h2>
            <p className="text-gray-500">Please wait while we prepare the content.</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 max-w-lg text-center">
                <h3 className="text-lg font-bold mb-2">Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/academy')} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg hover:bg-gray-50">
                    Back to Academy
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col pt-4 max-w-[1920px] mx-auto overflow-hidden px-4 gap-4">
            {/* Header */}
            <header className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/academy')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 line-clamp-1">{lesson?.title || chapterTitle}</h1>
                        <p className="text-xs text-gray-500">Interactive Lesson</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadLesson(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                        title="Regenerate Lesson"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Regenerate</span>
                    </button>

                    <button
                        onClick={isSpeaking ? togglePlay : () => lesson && speak(lesson.content)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isSpeaking
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                            : 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10'
                            }`}
                    >
                        {isSpeaking ? (isPaused ? <Play size={16} /> : <Pause size={16} />) : <Play size={16} />}
                        {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Read Lesson"}
                    </button>
                </div>
            </header>

            {/* Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">

                {/* Left: Content (Scrollable) */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm overflow-y-auto custom-scrollbar">
                    {lesson && (
                        <div className="prose prose-slate prose-lg prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-600 prose-p:leading-loose prose-li:text-gray-600 prose-li:my-2 max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkBreaks]}
                                components={{
                                    blockquote: ({ children }) => (
                                        <div className="bg-blue-50 border-l-4 border-primary p-4 my-6 rounded-r-xl text-gray-700 italic">
                                            {children}
                                        </div>
                                    ),
                                    hr: () => (
                                        <hr className="my-10 border-t-2 border-dashed border-gray-200" />
                                    ),
                                    h1: ({ ...props }) => (
                                        <h1 className="text-3xl font-bold text-primary mt-8 mb-6" {...props} />
                                    ),
                                    h2: ({ ...props }) => (
                                        <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-100" {...props} />
                                    ),
                                    a: ({ ...props }) => (
                                        <a className="text-primary hover:underline font-medium" {...props} />
                                    )
                                }}
                            >
                                {lesson.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Right: Avatar (Top) + Chat (Bottom) */}
                <div className="flex flex-col gap-4 min-h-0">

                    {/* Top: Avatar */}
                    <div className="h-[40%] bg-gradient-to-b from-blue-50 to-white rounded-2xl relative overflow-hidden flex items-center justify-center border border-blue-50">
                        <div className="w-full h-full flex items-center justify-center">
                            <Avatar />
                        </div>
                    </div>

                    {/* Bottom: Chat */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                <Bot size={16} className="text-primary" />
                                Chat with this Lesson
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-gray-400 text-sm mt-10">
                                    <p>Ask me anything about this lesson!</p>
                                    <p className="text-xs mt-1">"Cos'è questo concetto?"</p>
                                </div>
                            )}
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'user'
                                        ? 'bg-primary/10 text-primary rounded-tr-none'
                                        : 'bg-gray-100 text-gray-700 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none">
                                        <Loader2 size={16} className="animate-spin text-gray-400" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-3 border-t border-gray-50 flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask a question..."
                                className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || isChatLoading}
                                className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
