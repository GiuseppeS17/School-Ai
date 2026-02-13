import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateLesson, sendChatMessage, updateLesson, type Lesson } from '../services/api';
import { ArrowLeft, Loader2, Play, Pause, Send, Bot, RefreshCw, Mic, MicOff, Edit, Save, X, MessageSquare, StickyNote, Printer, Check, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
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

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Notes State
    const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
    const [notes, setNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Audio
    const { speak, togglePlay, isSpeaking, isPaused, stop } = useTextToSpeech();
    const { isListening, transcript, startListening, stopListening, hasRecognition } = useSpeechRecognition();

    // Effect to update input with transcript
    useEffect(() => {
        if (isListening) {
            setChatInput(transcript);
        }
    }, [transcript, isListening]);

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

    const [loadingProgress, setLoadingProgress] = useState(0);

    const loadLesson = async (force: boolean = false) => {
        try {
            setLoading(true);
            setLoadingProgress(0);
            setError(null);

            const result = await generateLesson(courseId, chapterTitle, force);

            // Handle Cached JSON
            if ('title' in result && 'content' in result) {
                setLesson(result as Lesson);
                setNotes(result.notes || "");
                setLoading(false);
                return;
            }

            // Handle Stream
            const reader = result as ReadableStreamDefaultReader<Uint8Array>;
            const decoder = new TextDecoder();
            let accumulatedContent = "";

            // Estimated char count for progress bar (avg lesson ~3000-4000 chars)
            // We'll cap the visual progress at 95% until done
            const ESTIMATED_LENGTH = 6000;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                // Calculate progress with a "soft landing"
                let percentage = (accumulatedContent.length / ESTIMATED_LENGTH) * 100;

                if (percentage > 90) {
                    percentage = 90 + (1 - Math.exp(-(percentage - 90) / 20)) * 9;
                }

                setLoadingProgress(Math.min(Math.round(percentage), 99));
            }

            // Finalize
            setLesson({
                title: chapterTitle,
                content: accumulatedContent,
                notes: "",
                generatedAt: new Date().toISOString()
            });
            setNotes("");
            setLoadingProgress(100);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load lesson.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!lesson) return;
        setIsSaving(true);
        try {
            const updated = await updateLesson(courseId, chapterTitle, editContent);
            setLesson(updated);
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to save lesson", e);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!lesson) return;
        setIsSavingNotes(true);
        try {
            // We pass undefined for content to only update notes
            const updated = await updateLesson(courseId, chapterTitle, lesson.content, notes);
            setLesson(updated);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);
        } catch (e) {
            console.error("Failed to save notes", e);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text(lesson?.title || chapterTitle, 10, 20);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Captured Notes - ${new Date().toLocaleDateString()}`, 10, 28);

        // Content
        doc.setFontSize(12);
        doc.setTextColor(0);

        const splitNotes = doc.splitTextToSize(notes || "No notes captured.", 180);
        doc.text(splitNotes, 10, 40);

        // Save
        const fileName = `${(lesson?.title || chapterTitle).replace(/[^a-z0-9]/gi, '_')}_notes.pdf`;
        doc.save(fileName);
    };

    const handleExportLessonPDF = () => {
        if (!lesson) return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const maxLineWidth = pageWidth - margin * 2;

        // Title
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(lesson.title, maxLineWidth);
        doc.text(titleLines, margin, 20);

        let cursorY = 20 + (titleLines.length * 10);

        // Content
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        // Simple Markdown strip (very basic, for better PDF readability)
        const cleanContent = lesson.content
            .replace(/#{1,6} /g, '') // remove headers
            .replace(/\*\*/g, '')   // remove bold
            .replace(/\*/g, '')     // remove italic
            .replace(/`/g, '');     // remove code ticks

        const textLines = doc.splitTextToSize(cleanContent, maxLineWidth);

        const lineHeight = 7;

        textLines.forEach((line: string) => {
            if (cursorY + lineHeight > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
            }
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
        });

        const fileName = `${lesson.title.replace(/[^a-z0-9]/gi, '_')}_lesson.pdf`;
        doc.save(fileName);
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md space-y-4 text-center">
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Generating Lesson...</h2>
                    <p className="text-gray-500 font-medium">{loadingProgress}% Complete</p>
                    <p className="text-xs text-gray-400 mt-2">Crafting a master-class experience for you.</p>
                </div>
            </div>
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
        <div className="relative h-[calc(100vh-100px)] flex flex-col pt-4 max-w-[1920px] mx-auto overflow-hidden px-4 gap-4">
            {/* Header */}
            <header className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/academy')} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-text-muted" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text-main line-clamp-1">{lesson?.title || chapterTitle}</h1>
                        <p className="text-xs text-text-muted">Interactive Lesson</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Mode Controls */}
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                            >
                                <X size={16} />
                                <span className="hidden sm:inline">Cancel</span>
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span className="hidden sm:inline">Save</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportLessonPDF}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                                title="Download Lesson PDF"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">PDF</span>
                            </button>
                            <button
                                onClick={() => {
                                    setEditContent(lesson?.content || "");
                                    setIsEditing(true);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                                title="Edit Lesson"
                            >
                                <Edit size={16} />
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                        </div>
                    )}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

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
                <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm overflow-y-auto custom-scrollbar relative">
                    {lesson && (
                        isEditing ? (
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-full p-4 bg-background text-text-main font-mono text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                placeholder="Edit lesson markdown..."
                            />
                        ) : (
                            <div className="prose prose-slate prose-lg prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-h2:text-3xl prose-h3:text-2xl prose-p:text-text-main prose-p:leading-loose prose-li:text-text-main prose-li:my-2 max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkBreaks]}
                                    components={{
                                        blockquote: ({ children }) => (
                                            <div className="bg-primary/10 border-l-4 border-primary p-4 my-6 rounded-r-xl text-text-muted italic">
                                                {children}
                                            </div>
                                        ),
                                        hr: () => (
                                            <hr className="my-10 border-t-2 border-dashed border-border" />
                                        ),
                                        h1: ({ ...props }) => (
                                            <h1 className="text-3xl font-bold text-primary mt-8 mb-6" {...props} />
                                        ),
                                        h2: ({ ...props }) => (
                                            <h2 className="text-2xl font-bold text-text-main mt-10 mb-4 pb-2 border-b border-border" {...props} />
                                        ),
                                        a: ({ ...props }) => (
                                            <a className="text-primary hover:underline font-medium" {...props} />
                                        ),
                                        strong: ({ ...props }) => (
                                            <strong className="font-bold text-text-main" {...props} />
                                        )
                                    }}
                                >
                                    {lesson.content}
                                </ReactMarkdown>
                            </div>
                        )
                    )}
                </div>

                {/* Right: Avatar & Chat/Notes */}
                <div className="flex flex-col h-full gap-4 min-h-0">

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mx-1 shrink-0">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'chat' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <MessageSquare size={16} />
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'notes' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <StickyNote size={16} />
                            Notes
                        </button>
                    </div>

                    {activeTab === 'chat' ? (
                        <>
                            {/* Top: Avatar */}
                            <div className="h-[40%] bg-gradient-to-b from-primary/5 to-surface rounded-2xl relative overflow-hidden flex items-center justify-center border border-primary/10">
                                <div className="w-full h-full flex items-center justify-center">
                                    <Avatar />
                                </div>
                            </div>

                            {/* Bottom: Chat */}
                            <div className="flex-1 bg-surface rounded-2xl border border-border shadow-sm flex flex-col min-h-0">
                                <div className="p-4 border-b border-border text-sm flex items-center gap-2 bg-gray-50/10">
                                    <h3 className="font-semibold text-text-main flex items-center gap-2">
                                        <Bot size={16} className="text-primary" />
                                        Chat with this Lesson
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {chatMessages.length === 0 && (
                                        <div className="text-center text-text-muted text-sm mt-10">
                                            <p>Ask me anything about this lesson!</p>
                                            <p className="text-xs mt-1">"Cos'è questo concetto?"</p>
                                        </div>
                                    )}
                                    {chatMessages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'user'
                                                ? 'bg-primary/10 text-primary rounded-tr-none'
                                                : 'bg-background text-text-main border border-border rounded-tl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isChatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-background p-3 rounded-2xl rounded-tl-none border border-border">
                                                <Loader2 size={16} className="animate-spin text-text-muted" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-3 border-t border-border flex items-end gap-2">
                                    <textarea
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={isListening ? "Listening..." : "Ask a question..."}
                                        rows={3}
                                        className={`flex-1 bg-background border-transparent focus:bg-surface focus:border-primary/20 rounded-xl px-4 py-3 text-sm text-text-main placeholder:text-text-muted outline-none transition-all resize-none custom-scrollbar min-h-[80px] max-h-[160px] ${isListening ? 'placeholder-red-500' : ''}`}
                                    />
                                    {hasRecognition && (
                                        <button
                                            onClick={isListening ? stopListening : startListening}
                                            className={`p-3 rounded-xl transition-colors mb-1 ${isListening
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 animate-pulse'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                                }`}
                                            title={isListening ? "Stop Listening" : "Start Listening"}
                                        >
                                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors mb-1"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-surface rounded-2xl border border-border shadow-sm flex flex-col p-4 relative h-full">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <StickyNote size={18} />
                                    My Notes
                                </h3>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="text-xs font-medium px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 transition-colors"
                                >
                                    {isSavingNotes ? "Saving..." : "Save Notes"}
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="text-xs font-medium px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                    title="Export to PDF"
                                >
                                    <Printer size={14} />
                                    PDF
                                </button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="flex-1 w-full bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-gray-700 text-sm resize-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-300 outline-none leading-relaxed custom-scrollbar placeholder:text-gray-400"
                                placeholder="Type your notes here..."
                            />
                            <p className="text-[10px] text-gray-400 mt-2 text-right">
                                Notes are independent of the lesson content.
                            </p>


                        </div>
                    )}
                </div>

            </div>

            {/* Save Success Popup */}
            {showSaveSuccess && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                        <Check size={16} />
                        Saved correctly!
                    </div>
                </div>
            )}

            {/* Cloud Notes Overlay - Removed */}
        </div>
    );
}


