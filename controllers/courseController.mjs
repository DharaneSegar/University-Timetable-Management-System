import Course from "../models/course.mjs";
import logger from "../utils/logger.mjs";
import nodemailer from "nodemailer";
import User from "../models/user.mjs";

const CourseController = {
  // Method to create a new Course
  createCourse: async (req, res) => {
    // Destructuring request body to extract Course details
    const { code, name, description, credits } = req.body;

    // Validation for required fields
    if (!code || !name || !description || !credits) {
      return res.status(422).json({ Error: "Fill in all details" });
    }

    try {
      // Checking if the Course already exists
      const preCourse = await Course.findOne({ code });

      if (preCourse) {
        return res.status(422).json({ Error: "This Course already exists" });
      }

      // Creating a new Course object
      const course = new Course({
        code,
        name,
        description,
        credits,
      });

      // Saving the course to the database
      await course.save();

      // Responding with the course object
      res.status(201).json(course);
      logger.info(`Course created successfully`);
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res.status(400).send({ message: `Error creating Course`, error });
      logger.error(error);
    }
  },

  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.find();
      res.status(200).json(courses);
      logger.info(`Course details fetched`);
    } catch (error) {
      res.status(500).json({ message: error });
      logger.error(`Error getting all courses ${error.message}`);
    }
  },

  // Method to update Course details by ID
  updateCourseById: async (req, res) => {
    try {
      const updateCourse = req.body;

      // Define fields that should not be updated
      const unupdatableFields = ["code"];

      // Check if any unupdatable fields are present in the request body
      const invalidFields = Object.keys(updateCourse).filter((key) =>
        unupdatableFields.includes(key)
      );

      // If any unupdatable fields are found, respond with an error message
      if (invalidFields.length > 0) {
        return res.status(422).json({
          Error: `Fields ${invalidFields.join(", ")} cannot be updated`,
        });
      }

      // Filter out unupdatable fields from the update object
      const filteredUpdate = Object.keys(updateCourse)
        .filter((key) => !unupdatableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateCourse[key];
          return obj;
        }, {});

      // Update Course details in the database
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        filteredUpdate,
        { new: true }
      );

      // Send success response with updated Course details
      res.status(200).send({
        updatedCourse,
        message: "Course details updated successfully",
      });
      logger.info(`Course details updated successfully`);
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Course update failed" }, error);
    }
  },

  // Method to delete Course by ID
  deleteCourseById: async (req, res) => {
    try {
      // Delete Course from the database
      await Course.findByIdAndDelete(req.params.id).then(() => {
        res.status(200).send({ message: "Course deleted successfully" }); // Send success message to the frontend
        logger.info(`Course deleted successfully`);
      });
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Course delete failed", error });
    }
  },

  // Method to get Course details by ID
  getCoursebyId: async (req, res) => {
    let id = req.params.id; // Get the ID from the request parameter

    await Course.findOne({ _id: `${id}` }) // Compare the ID with the requested ID and return the details
      .then((course) => {
        res.status(200).send({ status: "Course Details fetched", course }); // Send response as a JSON object and a status
        logger.info("Course Details fetched");
      })
      .catch((err) => {
        logger.error(err.message);

        res.status(500).send({
          status: "Error with fetching Course details",
          error: err.message,
        }); // Send error message
      });
  },

  // Method to assign faculty to a Course
  assignFacultyToCourse: async (req, res) => {
    try {
      const { facultyId, courseId } = req.body;

      // Check if the course exists
      const course = await Course.findById(courseId);

      // Check if the faculty exists
      const faculty = await User.findById(facultyId);

      if (!course) {
        return res.status(404).json({ Error: "Course not found" });
      }

      // Assign faculty to the course
      course.faculty = facultyId;

      // Save the updated course to the database
      await course.save();

      // Call the static method to send email notification
      await CourseController.sendEmailNotification(faculty.email, course.name);

      // Send success response
      res
        .status(200)
        .json({ message: "Faculty assigned to course successfully", course });
      logger.info(`Faculty assigned to course successfully`);
    } catch (error) {
      logger.error(error);
      res
        .status(400)
        .json({ message: "Failed to assign faculty to course", error });
    }
  },
};

// Static method to send email notification
CourseController.sendEmailNotification = async (facultyEmail, courseName) => {
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
    to: facultyEmail,
    subject: "Course Assignment Notification",
    html: `
            <p>Dear Faculty member,</p>
            <p>There have been assigned to the course "${courseName}".</p>
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

// Export CourseController object
export default CourseController;
