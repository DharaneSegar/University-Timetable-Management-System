import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import databaseConnection from "./config/database.mjs";
import logger from "./utils/logger.mjs";
import UserRouter from "./routes/userRoute.mjs";
import CourseRouter from "./routes/courseRoute.mjs";
import RoomRouter from "./routes/roomRoute.mjs";
import ResourceRouter from "./routes/resourceRoute.mjs";
import TimetableRouter from "./routes/timetableRoute.mjs";
import EnrollmentRouter from "./routes/enrollmentRoute.mjs";
import BookingRouter from "./routes/bookingRoute.mjs";

const app = express();
let PORT = process.env.PORT || "8050";

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(PORT, () => {
    logger.info(`Server is up and running on port ${PORT}`);
    databaseConnection();
});

// Routes
app.use("/user", UserRouter);
app.use("/course", CourseRouter);
app.use("/room", RoomRouter);
app.use("/resource", ResourceRouter);
app.use("/timetable", TimetableRouter);
app.use("/enrollment", EnrollmentRouter);
app.use("/booking", BookingRouter);

// Export the server instance for testing
export default server;
