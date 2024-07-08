import authenticate from "../config/authenticate.mjs";
import authorize from "../config/authorize.mjs";
import EnrollmentController from "../controllers/enrollmentController.mjs";
import express from "express";

const EnrollmentRouter = express.Router();

EnrollmentRouter.post("/",authenticate,authorize('admin' || 'faculty' || 'student'), EnrollmentController.enrollStudentInCourse);
EnrollmentRouter.get("/viewEnrollment/:courseId", authenticate,authorize('admin' || 'faculty'),EnrollmentController.viewStudentEnrollments);
EnrollmentRouter.get("/viewCourse/:studentId",authenticate,authorize('admin' || 'faculty' || 'student'),EnrollmentController.viewStudentEnrolledCourses);
EnrollmentRouter.put('/:enrollmentId',authenticate,authorize('admin' || 'faculty'),EnrollmentController.updateStudentEnrollment);
EnrollmentRouter.delete('/:enrollmentId',authenticate,authorize('admin' || 'faculty'),EnrollmentController.removeStudentEnrollment);
EnrollmentRouter.get("/",authenticate,authorize('admin' || 'faculty' || 'student'), EnrollmentController.getAllEnrollments);
EnrollmentRouter.get('/:id',authenticate,authorize('admin' || 'faculty' || 'student'),EnrollmentController.getEnrollmentbyId);

export default EnrollmentRouter;
