import { Request, Response } from 'express';
import { db } from '../services/db';
// We'll add test generation later

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = db.getCourses();
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = db.getCourse(id);

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        db.deleteCourse(id);
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
};
