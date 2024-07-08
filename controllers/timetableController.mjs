import Course from "../models/course.mjs";
import logger from "../utils/logger.mjs";
import nodemailer from "nodemailer";
import Room from "../models/room.mjs";
import Resource from "../models/resource.mjs";
import Timetable from "../models/timetable.mjs";
import User from "../models/user.mjs";

const TimetableController = {
  // Method to create a new Timetable entry
  createTimetableEntry: async (req, res) => {
    try {
      const { courseId, dayOfWeek, startTime, endTime, roomId, resourceId } =
        req.body;

      // Check if the course exists
      const course = await Course.findOne({ _id: `${courseId}` });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if the room is available
      const room = await Room.findOne({ _id: `${roomId}` });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      // Check if the resource is available
      if (resourceId) {
        const resource = await Resource.findById({ _id: `${resourceId}` });
        if (!resource) {
          return res.status(404).json({ message: "Resource not found" });
        }
      }

      // Check if there's already a timetable entry for the same room, day, and time
      const existingTimetableEntry = await Timetable.findOne({
        roomId,
        dayOfWeek,
        $or: [
          {
            $and: [
              { startTime: { $lte: startTime } },
              { endTime: { $gte: startTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lte: endTime } },
              { endTime: { $gte: endTime } },
            ],
          },
        ],
      });
      if (existingTimetableEntry) {
        return res
          .status(409)
          .json({ message: "Room already booked for the specified time" });
      }

      // If resourceId is provided, also check for resource availability

      // Creating a new Timetable entry
      const timetableEntry = new Timetable({
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        roomId,
        resourceId,
      });

      // Saving the Timetable entry to the database
      await timetableEntry.save();

      // Responding with the Timetable entry object
      res.status(201).json(timetableEntry);
      logger.info(`Timetable entry created successfully`);
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res
        .status(400)
        .send({ message: `Error creating Timetable entry`, error });
      logger.error(error);
    }
  },

  // Method to get timetable entries by course Id
  getTimetableEntriesBycourseId: async (req, res) => {
    try {
      const courseId = req.params.courseId;

      // Find all timetable entries for the given course ID
      const timetableEntries = await Timetable.find({
        courseId: `${courseId}`,
      });

      // If no timetable entries are found, return a 404 status code with a message
      if (!timetableEntries || timetableEntries.length === 0) {
        return res.status(404).json({
          message: "No timetable entries found for the provided course ID",
        });
      }

      // Respond with the timetable entries found
      res.status(200).json(timetableEntries);
      logger.info(
        `Timetable entries for course ID ${courseId} fetched successfully`
      );
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res
        .status(500)
        .send({ message: `Error retrieving timetable entries`, error });
      logger.error(error);
    }
  },

// Method to update a Timetable entry by ID
updateTimetableEntryById: async (req, res) => {
  try {
    const updateFields = req.body;

    // Check if the room is available
    if (updateFields.roomId) {
      const room = await Room.findOne({ _id: updateFields.roomId });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
    }

    // Check if the resource is available
    if (updateFields.resourceId) {
      const resource = await Resource.findById(updateFields.resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
    }

    // Check if the course exists
    if (updateFields.courseId) {
      const course = await Course.findOne({ _id: updateFields.courseId });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
    }

    // Check if there's already a conflicting timetable entry
    if (
      updateFields.roomId &&
      (updateFields.dayOfWeek ||
        updateFields.startTime ||
        updateFields.endTime)
    ) {
      const conflictingEntry = await Timetable.findOne({
        _id: { $ne: req.params.id }, // Exclude the current timetable entry
        roomId: updateFields.roomId,
        dayOfWeek: updateFields.dayOfWeek,
        $or: [
          {
            $and: [
              { startTime: { $lte: updateFields.startTime } },
              { endTime: { $gte: updateFields.startTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lte: updateFields.endTime } },
              { endTime: { $gte: updateFields.endTime } },
            ],
          },
        ],
      });
      if (conflictingEntry) {
        return res
          .status(409)
          .json({ message: "Room already booked for the specified time" });
      }
    }

    // Update the timetable entry
    const updatedTimetableEntry = await Timetable.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    // Fetch the timetable entry
    const timetableEntry = await Timetable.findById(req.params.id);
    const course = await Course.findById(timetableEntry.courseId);

    // Fetch enrolled students for the course associated with the timetable entry
    const enrolledStudents = await User.find({ enrolledCourses: timetableEntry.courseId });

    // Send email notification to enrolled students
    enrolledStudents.forEach(async (student) => {
      await TimetableController.sendEmailNotification(student.email, course.name, `Updated timetable for ${course.name}`);
    });

    // Respond with success message
    res.status(200).json({
      message: "Timetable entry updated successfully",
      updatedTimetableEntry,
    });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Failed to update timetable entry", error });
  }
},


  // Method to view timetable by student ID
  viewStudentTimetable: async (req, res) => {
    try {
      const studentId = req.params.studentId;

      // Find student
      const student = await User.findById({ _id: `${studentId}` });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Get timetable for enrolled courses
      const timetable = await Timetable.find({
        courseId: { $in: student.enrolledCourses },
      });

      res.status(200).json({ timetable });
      logger.info(`Student timetable fetched successfully`);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to fetch student timetable", error });
      logger.error(error);
    }
  },

  // Method to delete a Timetable entry by ID
  deleteTimetableEntryById: async (req, res) => {
    try {
      // Delete Timetable entry from the database
      await Timetable.findByIdAndDelete(req.params.id);

      res.status(200).send({ message: "Timetable entry deleted successfully" });
      logger.info(`Timetable entry deleted successfully`);
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Timetable entry delete failed", error });
    }
  },

  // Method to get a Timetable entry by ID
  getTimetableEntryById: async (req, res) => {
    try {
      const timetableEntry = await Timetable.findById(req.params.id);

      if (!timetableEntry) {
        return res.status(404).send({ message: "Timetable entry not found" });
      }

      res.status(200).json(timetableEntry);
      logger.info(`Timetable entry details fetched`);
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .send({ message: "Error getting Timetable entry details", error });
    }
  },

  // Method to get all Timetable entries
  getAllTimetableEntries: async (req, res) => {
    try {
      const timetableEntries = await Timetable.find();
      res.status(200).json(timetableEntries);
      logger.info(`All Timetable entries fetched`);
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .send({ message: "Error getting all Timetable entries", error });
    }
  },
};

// Static method to send email notification
TimetableController.sendEmailNotification = async (
  studentEmail,
  courseName,
  timetableDetails
) => {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
    tls: {
      // Allow self-signed certificates
      rejectUnauthorized: false,
    },
  });

  // Define email content
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: studentEmail,
    subject: "Timetable Update Notification",
    html: `
            <p>Dear Student,</p>
            <p>There has been an update in the timetable for the course "${courseName}".</p>
            <p>New Timetable Details:</p>
            <p>${timetableDetails}</p>
            <p>Regards,</p>
            <p>SLIIT Timetable Management System</p>
        `,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};
export default TimetableController;
