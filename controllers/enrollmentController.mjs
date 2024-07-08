import Course from "../models/course.mjs";
import Enrollment from "../models/enrollment.mjs";
import logger from "../utils/logger.mjs";
import nodemailer from "nodemailer";
import User from "../models/user.mjs";

const EnrollmentController = {
  // Method to enroll a student in course
  enrollStudentInCourse: async (req, res) => {
    try {
      const { studentId, courseId } = req.body;

      // Check if student and course exist
      const student = await User.findById({ _id: `${studentId}` });

      if (student.role !== "student") {
        return res.status(404).json({ error: "Student not found" });
      }

      const course = await Course.findById({ _id: `${courseId}` });
      if (!student || !course) {
        return res.status(404).json({ message: "Student or course not found" });
      }

      // Check if student is already enrolled in the course
      const existingEnrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });
      if (existingEnrollment) {
        return res
          .status(409)
          .json({ message: "Student is already enrolled in the course" });
      }

      // Create new enrollment
      const enrollment = new Enrollment({
        student: studentId,
        course: courseId,
      });
      await enrollment.save();

      // Update student's enrolled courses list
      student.enrolledCourses.push(courseId);
      await student.save();

      res.status(201).json({
        message: "Student enrolled in course successfully",
        enrollment,
      });
      logger.info(`Student enrolled in course successfully`);

      // Call the static method to send email notification
      await EnrollmentController.sendEmailNotification(
        student.email,
        course.name
      );
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to enroll student in course", error });
      logger.error(error);
    }
  },

  // Method to view student enrollments in a course
  viewStudentEnrollments: async (req, res) => {
    try {
      const courseId = req.params.courseId;

      // Check if student and course exist
      const course = await Course.findById({ _id: `${courseId}` });

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Find enrollments for the specified course
      const enrollments = await Enrollment.find({ course: courseId }).populate(
        "student"
      );

      if (enrollments.length === 0) {
        return res
          .status(200)
          .json({ message: "No enrollments for this course" });
      }

      res.status(200).json(enrollments);
      logger.info(
        `Student enrollments for course ${courseId} fetched successfully`
      );
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to fetch student enrollments", error });
      logger.error(error);
    }
  },

  // Method to view courses in which a student is enrolled
  viewStudentEnrolledCourses: async (req, res) => {
    try {
      const studentId = req.params.studentId;

      // Find enrollments for the specified student
      const enrollments = await Enrollment.find({
        student: studentId,
      }).populate("course");

      if (enrollments.length === 0) {
        return res
          .status(200)
          .json({ message: "Student is not enrolled in any courses" });
      }

      res.status(200).json(enrollments);
      logger.info(
        `Courses enrolled by student ${studentId} fetched successfully`
      );
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to fetch student's enrolled courses", error });
      logger.error(error);
    }
  },

  // Method to remove student enrollment from a course
  removeStudentEnrollment: async (req, res) => {
    try {
      const enrollmentId = req.params.enrollmentId;

      // Find the enrollment to get the student and course information
      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        return res.status(404).send({ message: "Enrollment not found" });
      }

      // Remove enrollment
      await Enrollment.findByIdAndDelete(enrollmentId);

      // Remove course from student's enrolled courses list
      const student = await User.findById(enrollment.student);
      if (!student) {
        return res.status(404).send({ message: "Student not found" });
      }
      const courseId = enrollment.course;
      const index = student.enrolledCourses.indexOf(courseId);
      if (index !== -1) {
        student.enrolledCourses.splice(index, 1);
        await student.save();
      }

      res
        .status(200)
        .send({ message: "Student enrollment removed successfully" });
      logger.info(`Student enrollment ${enrollmentId} removed successfully`);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ message: "Failed to remove student enrollment", error });
      logger.error(error);
    }
  },

  // Method to update student enrollment in a course
  updateStudentEnrollment: async (req, res) => {
    try {
      const enrollmentId = req.params.enrollmentId;
      const updateData = req.body;

      // If courseId is provided, check if it's valid
      if (updateData.courseId) {
        const courseIdIsValid = await Course.exists({
          _id: updateData.courseId,
        });
        if (!courseIdIsValid) {
          return res.status(400).send({ message: "Invalid courseId" });
        }
      }

      // If studentId is provided, check if it's valid
      if (updateData.studentId) {
        const studentIdIsValid = await User.exists({
          _id: updateData.studentId,
        });
        if (!studentIdIsValid) {
          return res.status(400).json({ message: "Invalid studentId" });
        }
      }

      // Update enrollment
      const updatedEnrollment = await Enrollment.findByIdAndUpdate(
        enrollmentId,
        updateData,
        { new: true }
      );

      res.status(200).send({
        message: "Student enrollment updated successfully",
        updatedEnrollment,
      });
      logger.info(`Student enrollment ${enrollmentId} updated successfully`);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Failed to update student enrollment", error });
      logger.error(error);
    }
  },

  // Method to get all enrollments
  getAllEnrollments: async (req, res) => {
    try {
      const enrollments = await Enrollment.find();
      res.status(200).json(enrollments);
      logger.info(`All enrollments fetched`);
    } catch (error) {
      logger.error(`Error getting all enrollments: ${error}`);
      res.status(500).json({ message: "Error getting all enrollments" });
    }
  },

  // Method to get Enrollment details by ID
  getEnrollmentbyId: async (req, res) => {
    let id = req.params.id; // Get the ID from the request parameter

    await Enrollment.findOne({ _id: `${id}` }) // Compare the ID with the requested ID and return the details
      .then((enrollment) => {
        res
          .status(200)
          .send({ status: "Enrollment Details fetched", enrollment }); // Send response as a JSON object and a status
        logger.info("Enrollment Details fetched");
      })
      .catch((err) => {
        logger.error(err.message);

        res.status(500).send({
          status: "Error with fetching Enrollment details",
          error: err.message,
        }); // Send error message
      });
  },
};

// Static method to send email notification
EnrollmentController.sendEmailNotification = async (
  studentEmail,
  courseName
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
    subject: "Course Enrollment Notification",
    html: `
              <p>Dear Student,</p>
              <p>You have been enrolled for the course "${courseName}".</p>
              <p>Regards,</p>
              <p>SLIIT Timetable Management System</p>
          `,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    logger.error("Error sending email: ", error);
  }
};

export default EnrollmentController;
