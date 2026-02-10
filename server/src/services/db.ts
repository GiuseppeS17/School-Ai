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

export interface Lesson {
    id: string;
    courseId: string;
    chapterTitle: string;
    title: string;
    content: string;
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
        this.data = { courses: [], tests: [] };
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
            } catch (error) {
                console.error("Error reading DB file, initializing empty:", error);
                this.data = { courses: [], tests: [] };
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
}

export const db = new Database();
