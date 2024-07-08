import Course from "../models/course.mjs";
import CourseController from "../controllers/courseController.mjs";

jest.mock("../utils/logger.mjs", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("CourseController", () => {
  let createdCourseId;
  describe("createCourse", () => {
    test("should create a new Course", async () => {
      // Mock request and response objects
      const req = {
        body: {
          code: "IT105",
          name: "Introduction to Computer Systems",
          description:
            "An introductory course covering basic concepts in computer science.",
          credits: 4,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock database functions and Course save method

      Course.findOne = jest.fn().mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(req.body);
      Course.prototype.save = saveMock;

      // Call the controller method
      await CourseController.createCourse(req, res);

      createdCourseId = res.json.mock.calls[0][0]._id;

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("updateCourseById", () => {
    test("should update Course details by ID", async () => {
      // Mock request and response objects
      const req = {
        body: {
          credits: 3,
        },
        params: {
          id: createdCourseId, // Use the created Course's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Course.findOne = jest.fn().mockResolvedValue(null); // No conflicting entry
      Course.findByIdAndUpdate = jest.fn().mockResolvedValue(req.body);

      // Call the controller method
      await CourseController.updateCourseById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Course details updated successfully",
        updatedCourse: req.body,
      });
    });
  });

  describe("deleteCourseById", () => {
    test("should delete Course by ID", async () => {
      // Mock request and response objects
      const req = {
        params: {
          id: createdCourseId, // Use the created Course's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock Booking.findByIdAndDelete method
      Course.findByIdAndDelete = jest.fn().mockResolvedValueOnce();

      // Call the controller method
      await CourseController.deleteCourseById(req, res);

      // Assertions
      expect(Course.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Course deleted successfully",
      });
    });
  });

  describe("getAllCourses", () => {
    test("should get all Courses", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Course.find() method
      const fakeCourses = [{ code: "CS101" }];
      Course.find = jest.fn().mockResolvedValue(fakeCourses);

      // Call the controller method
      await CourseController.getAllCourses(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCourses);
    });

    test("should handle errors", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Course.find() method to throw an error
      const errorMessage = "Internal Server Error";
      Course.find = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Call the controller method
      await CourseController.getAllCourses(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
