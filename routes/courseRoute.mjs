
import authenticate from '../config/authenticate.mjs';
import authorize from '../config/authorize.mjs';
import CourseController from '../controllers/courseController.mjs';
import express from "express";

const CourseRouter = express.Router();

CourseRouter.post('/',authenticate,authorize('admin' || 'faculty'), CourseController.createCourse);
CourseRouter.get('/',authenticate,authorize('admin' || 'faculty' || 'student'),CourseController.getAllCourses);
CourseRouter.put('/:id',authenticate,authorize('admin' || 'faculty'),CourseController.updateCourseById);
CourseRouter.delete('/:id',authenticate,authorize('admin' || 'faculty'),CourseController.deleteCourseById);
CourseRouter.get('/:id',authenticate,authorize('admin' || 'faculty' || 'student'),CourseController.getCoursebyId);
CourseRouter.post('/assignCourse',authenticate,authorize('admin'),CourseController.assignFacultyToCourse);

export default CourseRouter;