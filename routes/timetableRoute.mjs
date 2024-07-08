
import authenticate from '../config/authenticate.mjs';
import authorize from '../config/authorize.mjs';
import express from "express";
import TimetableController from '../controllers/timetableController.mjs';

const TimetableRouter = express.Router();

TimetableRouter.post('/',authenticate,authorize('admin' || 'faculty'), TimetableController.createTimetableEntry);
TimetableRouter.get('/',authenticate,authorize('admin' || 'faculty' || 'student'),TimetableController.getAllTimetableEntries);
TimetableRouter.put('/:id',authenticate,authorize('admin' || 'faculty'),TimetableController.updateTimetableEntryById);
TimetableRouter.delete('/:id',authenticate,authorize('admin' || 'faculty'),TimetableController.deleteTimetableEntryById);
TimetableRouter.get('/:id',authenticate,authorize('admin' || 'faculty' || 'student'),TimetableController.getTimetableEntryById);
TimetableRouter.get('/getCourse/:courseId',authenticate,authorize('admin' || 'faculty' || 'student'),TimetableController.getTimetableEntriesBycourseId);
TimetableRouter.get("/viewTimetable/:studentId",authenticate,authorize('admin' || 'faculty' || 'student'), TimetableController.viewStudentTimetable);

export default TimetableRouter;