import authenticate from "../config/authenticate.mjs";
import authorize from "../config/authorize.mjs";
import BookingController from "../controllers/bookingController.mjs";
import express from "express";

const BookingRouter = express.Router();

BookingRouter.post("/",authenticate,authorize('admin' || 'faculty' || 'student'), BookingController.createBookingEntry);
BookingRouter.get("/",authenticate,authorize('admin' || 'faculty' || 'student'), BookingController.getAllBookingEntries);
BookingRouter.put("/:id",authenticate,authorize('admin'), BookingController.updateBookingEntryById);
BookingRouter.delete("/:id",authenticate,authorize('admin'), BookingController.deleteBookingEntryById);
BookingRouter.get("/:id",authenticate,authorize('admin' || 'faculty' || 'student'), BookingController.getBookingEntryById);
BookingRouter.get("/getBooking/:userId",authenticate,authorize('admin' || 'faculty' || 'student'),BookingController.getBookingEntriesByuserId);

export default BookingRouter;
