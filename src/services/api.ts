export const API_BASE_URL = 'http://localhost:3001';

export const uploadDocument = async (file: File): Promise<{ message: string, chunks: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/ingest/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    return response.json();
};

export interface ChatResponse {
    response: string;
    sources: string[];
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Chat failed: ${response.statusText}`);
    }

    return response.json();
};

export interface Course {
    id: string;
    title: string;
    description: string;
    chapters: { title: string; start_context: string }[];
}

export const getCourses = async (): Promise<Course[]> => {
    const response = await fetch(`${API_BASE_URL}/api/courses`);
    if (!response.ok) {
        throw new Error('Failed to fetch courses');
    }
    return response.json();
};

export const deleteCourse = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete course');
    }
};

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

export interface Test {
    id: string;
    courseId: string;
    chapterTitle: string;
    questions: Question[];
}

export const generateTest = async (courseId: string, chapterTitle: string, difficulty: string = 'medium'): Promise<Test> => {
    const response = await fetch(`${API_BASE_URL}/api/tests/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, chapterTitle, difficulty })
    });

    if (!response.ok) {
        throw new Error('Failed to generate test');
    }
    return response.json();
};

export interface Lesson {
    title: string;
    content: string;
    generatedAt: string;
}

export const generateLesson = async (courseId: string, chapterTitle: string, forceRegenerate: boolean = false): Promise<Lesson> => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, chapterTitle, forceRegenerate })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate lesson: ${response.statusText}`);
    }
    return response.json();
};
