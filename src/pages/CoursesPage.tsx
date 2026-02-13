import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, deleteCourse, type Course } from '../services/api';
import { Book, FileText, ChevronRight, Trash2 } from 'lucide-react';

export function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await getCourses();
            if (!Array.isArray(data)) {
                // Fallback logic
                // @ts-ignore
                if (data && data.courses && Array.isArray(data.courses)) setCourses(data.courses);
                else {
                    console.error("Invalid courses data", data);
                    // If empty object, maybe just empty
                    setCourses([]);
                }
            } else {
                setCourses(data);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSelect = (courseId: string, chapterTitle: string) => {
        navigate('/lesson', { state: { courseId, chapterTitle } });
    };

    const toggleCourseExpanded = (courseId: string) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    };

    const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation(); // Prevent navigation
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            await deleteCourse(courseId);
            // Refresh courses
            loadCourses();
        } catch (err) {
            console.error(err);
            alert("Failed to delete course");
        }
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading Academy...</div>;

    const safeCourses = Array.isArray(courses) ? courses : [];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Academy</h1>
                <p className="text-text-muted">Explore your uploaded books organized as courses.</p>
            </header>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {safeCourses.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-gray-200">
                    <Book size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-text-muted">Library is Empty</h3>
                    <p className="text-gray-400 mt-2">Upload a book in the Dashboard to generate lessons automatically.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {safeCourses.map(course => {
                        const isExpanded = expandedCourses[course.id];
                        const displayedChapters = isExpanded ? course.chapters : (course.chapters || []).slice(0, 5);
                        const remainingCount = (course.chapters?.length || 0) - 5;

                        return (
                            <div key={course.id} className="bg-surface rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all group h-fit">
                                <div className="flex items-start gap-4 mb-4 relative">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Book size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-text-main line-clamp-1 mr-8">{course.title}</h3>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteCourse(e, course.id)}
                                        className="absolute -top-2 -right-2 p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Chapters</div>
                                    {course.chapters && course.chapters.length > 0 ? (
                                        <ul className="space-y-2">
                                            {displayedChapters.map((chapter, idx) => (
                                                <li
                                                    key={idx}
                                                    onClick={() => handleLessonSelect(course.id, chapter.title)}
                                                    className="flex items-center gap-2 text-sm text-text-main p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                                    <span className="flex-1 line-clamp-1">{chapter.title}</span>
                                                    <ChevronRight size={14} className="text-gray-300" />
                                                </li>
                                            ))}
                                            {remainingCount > 0 && !isExpanded && (
                                                <li
                                                    onClick={() => toggleCourseExpanded(course.id)}
                                                    className="text-xs text-center text-primary font-medium pt-2 cursor-pointer hover:underline"
                                                >
                                                    + {remainingCount} more lessons
                                                </li>
                                            )}
                                            {isExpanded && (
                                                <li
                                                    onClick={() => toggleCourseExpanded(course.id)}
                                                    className="text-xs text-center text-gray-400 font-medium pt-2 cursor-pointer hover:underline"
                                                >
                                                    Show less
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <div className="text-sm text-text-muted italic flex items-center gap-2">
                                            <FileText size={14} /> No chapters detected
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
