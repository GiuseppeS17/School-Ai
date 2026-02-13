import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface Chapter {
    title: string;
    start_context?: string; // First few words/sentences of the chapter
    startIndex?: number;
    endIndex?: number;
    contentFile?: string; // Relative path to chapter text file
}

export interface Course {
    id: string;
    title: string;
    description: string;
    sourceFile: string;
    chapters: Chapter[];
    createdAt: string;
}

export interface Test {
    id: string;
    courseId: string;
    chapterIndex?: number; // If specific to a chapter
    questions: any[];
    createdAt: string;
}

export interface CloudNote {
    id: string;
    text: string;
    x: number;
    y: number;
    color?: string;
}

export interface Lesson {
    id: string;
    courseId: string;
    chapterTitle: string;
    title: string;
    content: string;
    notes?: string;
    cloudNotes?: CloudNote[];
    generatedAt: string;
}

interface DatabaseSchema {
    courses: Course[];
    tests: Test[];
    lessons?: Lesson[];
}

class Database {
    private data: DatabaseSchema;

    constructor() {
        this.data = { courses: [], tests: [], lessons: [] };
        this.load();
    }

    private load() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        if (fs.existsSync(DB_FILE)) {
            try {
                const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
                this.data = JSON.parse(fileContent);
                if (!this.data.lessons) this.data.lessons = [];
            } catch (error) {
                console.error("Error reading DB file, initializing empty:", error);
                this.data = { courses: [], tests: [], lessons: [] };
            }
        } else {
            this.save();
        }
    }

    private save() {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    }

    // --- Courses ---
    public getCourses(): Course[] {
        return this.data.courses;
    }

    public getCourse(id: string): Course | undefined {
        return this.data.courses.find(c => c.id === id);
    }

    public addCourse(course: Course) {
        this.data.courses.push(course);
        this.save();
    }

    public deleteCourse(id: string) {
        this.data.courses = this.data.courses.filter(c => c.id !== id);
        this.save();
    }

    // --- Tests ---
    public getTests(): Test[] {
        return this.data.tests;
    }

    public addTest(test: Test) {
        this.data.tests.push(test);
        this.save();
    }

    // --- Lessons ---
    public getLesson(courseId: string, chapterTitle: string): Lesson | undefined {
        return this.data.lessons?.find(l => l.courseId === courseId && l.chapterTitle === chapterTitle);
    }

    public addLesson(lesson: Lesson) {
        if (!this.data.lessons) {
            this.data.lessons = [];
        }
        // Remove existing if any (overwrite)
        this.data.lessons = this.data.lessons.filter(
            l => !(l.courseId === lesson.courseId && l.chapterTitle === lesson.chapterTitle)
        );
        this.data.lessons.push(lesson);
        this.save();
    }

    public updateLesson(courseId: string, chapterTitle: string, content?: string, notes?: string, cloudNotes?: CloudNote[]): Lesson | null {
        if (!this.data.lessons) {
            console.log("[DB] UpdateLesson: No lessons array found!");
            return null;
        }

        const lessonIndex = this.data.lessons.findIndex(l => l.courseId === courseId && l.chapterTitle === chapterTitle);
        if (lessonIndex === -1) {
            console.log(`[DB] UpdateLesson: Lesson not found for Course: ${courseId}, Chapter: ${chapterTitle}`);
            return null;
        }

        // Update content if provided
        if (content !== undefined) {
            this.data.lessons[lessonIndex].content = content;
        }

        // Update notes if provided
        if (notes !== undefined) {
            this.data.lessons[lessonIndex].notes = notes;
        }

        // Update cloudNotes if provided
        if (cloudNotes !== undefined) {
            this.data.lessons[lessonIndex].cloudNotes = cloudNotes;
        }

        this.save();
        return this.data.lessons[lessonIndex];
    }
}

export const db = new Database();
