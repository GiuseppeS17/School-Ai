import { useState, useEffect } from 'react';
import { getCourses, generateTest, type Course, type Test } from '../services/api';
import { BrainCircuit, CheckCircle, XCircle, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

export function TestsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');

    // Quiz State
    const [loading, setLoading] = useState(false);
    const [currentTest, setCurrentTest] = useState<Test | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await getCourses();
            if (Array.isArray(data)) {
                setCourses(data);
            } else {
                console.error("Invalid courses data", data);
                // @ts-ignore
                if (data && data.courses && Array.isArray(data.courses)) setCourses(data.courses);
            }
        } catch (e) {
            console.error("Error loading courses", e);
        }
    };

    const handleGenerateTest = async () => {
        if (!selectedCourse || !selectedChapter) return;

        setLoading(true);
        setCurrentTest(null);
        setSubmitted(false);
        setUserAnswers({});

        try {
            const test = await generateTest(selectedCourse, selectedChapter);
            setCurrentTest(test);
        } catch (e) {
            alert("Failed to generate test. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, optionIndex: number) => {
        if (submitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = () => {
        if (!currentTest) return;
        let correctCount = 0;
        currentTest.questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) correctCount++;
        });
        setScore(correctCount);
        setSubmitted(true);
    };

    const resetQuiz = () => {
        setCurrentTest(null);
        setSubmitted(false);
        setUserAnswers({});
        setScore(0);
    };

    const activeCourse = courses.find(c => c.id === selectedCourse);

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-[80vh]">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                    <BrainCircuit /> Training Ground
                </h1>
                <p className="text-text-muted">Generate AI quizzes from your uploaded books to test your mastery.</p>
            </header>

            {!currentTest && !loading && (
                <div className="bg-surface rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 text-text-main">Create a New Challenge</h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Select Book</label>
                            <select
                                className="w-full p-3 rounded-xl border bg-white focus:ring-2 ring-primary/20 outline-none"
                                value={selectedCourse}
                                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedChapter(''); }}
                            >
                                <option value="">-- Choose a Course --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Select Chapter</label>
                            <select
                                className="w-full p-3 rounded-xl border bg-white focus:ring-2 ring-primary/20 outline-none"
                                value={selectedChapter}
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                disabled={!selectedCourse}
                            >
                                <option value="">-- Choose a Lesson --</option>
                                <option value="GENERAL" className="font-bold text-primary">★ General (All Chapters)</option>
                                {activeCourse?.chapters.map((ch, idx) => (
                                    <option key={idx} value={ch.title}>{ch.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateTest}
                        disabled={!selectedCourse || !selectedChapter}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${selectedCourse && selectedChapter
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg hover:translate-y-[-2px]'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <BrainCircuit size={24} /> {selectedChapter === 'GENERAL' ? 'Generate General Quiz' : 'Generate Quiz'}
                    </button>
                </div>
            )}

            {loading && (
                <div className="text-center py-20 animate-pulse">
                    <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-medium text-text-main">Consulting the Oracle...</h3>
                    <p className="text-text-muted">Reading the chapter and crafting tricky questions.</p>
                </div>
            )}

            {currentTest && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-text-main">Running Test: <span className="text-primary">{selectedChapter}</span></h2>
                        {submitted && (
                            <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-lg">
                                Score: {score} / {currentTest.questions.length}
                            </div>
                        )}
                    </div>

                    {currentTest.questions.map((q, idx) => {
                        const isCorrect = submitted && userAnswers[q.id] === q.correctAnswer;
                        const isWrong = submitted && userAnswers[q.id] !== q.correctAnswer;

                        return (
                            <div key={q.id} className={`p-6 rounded-2xl border ${submitted ? (isCorrect ? 'border-green-200 bg-green-50' : (isWrong ? 'border-red-200 bg-red-50' : 'border-gray-100')) : 'bg-surface border-gray-100'} shadow-sm`}>
                                <h3 className="text-lg font-semibold mb-4 flex gap-3">
                                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                                    {q.text}
                                </h3>

                                <div className="space-y-3 pl-11">
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = userAnswers[q.id] === optIdx;
                                        let btnClass = "border-gray-200 hover:bg-gray-50";

                                        if (submitted) {
                                            if (optIdx === q.correctAnswer) btnClass = "bg-green-100 border-green-400 text-green-800";
                                            else if (isSelected) btnClass = "bg-red-100 border-red-400 text-red-800";
                                        } else {
                                            if (isSelected) btnClass = "bg-primary/10 border-primary text-primary";
                                        }

                                        return (
                                            <button
                                                key={optIdx}
                                                onClick={() => handleAnswer(q.id, optIdx)}
                                                disabled={submitted}
                                                className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${btnClass}`}
                                            >
                                                <span>{opt}</span>
                                                {submitted && optIdx === q.correctAnswer && <CheckCircle size={20} className="text-green-600" />}
                                                {submitted && isSelected && optIdx !== q.correctAnswer && <XCircle size={20} className="text-red-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-end pt-8 pb-20">
                        {!submitted ? (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 shadow-lg flex items-center gap-2"
                            >
                                Submit Answers <ArrowRight />
                            </button>
                        ) : (
                            <button
                                onClick={resetQuiz}
                                className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-700 shadow-lg flex items-center gap-2"
                            >
                                <RefreshCw /> Try Another Quiz
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
