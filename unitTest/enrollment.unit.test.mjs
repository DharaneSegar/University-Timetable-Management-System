import Course from "../models/course.mjs";
import Enrollment from "../models/enrollment.mjs";
import EnrollmentController from "../controllers/enrollmentController.mjs";
import User from "../models/user.mjs";

jest.mock("../models/user");
jest.mock("../models/course");
jest.mock("../models/enrollment");

jest.mock("../utils/logger.mjs", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("EnrollmentController", () => {
  let createdEnrollmentId;
  describe("enrollStudentInCourse", () => {
    it("should enroll a student in a course", async () => {
      // Mock request and response objects
      const req = {
        body: {
          studentId: "65fe91b7042056bf04dcb66e",
          courseId: "65facb7b2da33e0979ec12ef",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock behavior of User model methods
      User.findById.mockResolvedValueOnce({
        role: "student",
        enrolledCourses: [],
        save: jest.fn().mockResolvedValueOnce(),
      });

      // Mock behavior of Course model methods
      Course.findById.mockResolvedValueOnce({ name: "Course Name" });

      // Mock behavior of Enrollment model methods
      Enrollment.findOne.mockResolvedValueOnce(null);
      const enrollmentSaveMock = jest
        .spyOn(Enrollment.prototype, "save")
        .mockResolvedValueOnce();

      // Call the controller method
      await EnrollmentController.enrollStudentInCourse(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Student enrolled in course successfully",
        enrollment: expect.any(Object),
      });
      expect(enrollmentSaveMock).toHaveBeenCalled();
    });
  });

  describe("getAllEnrollments", () => {
    test("should get all Enrollments", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Enrollment.find() method
      const fakeEnrollments = [{ courseId: "65facb7b2da35e0979ec12ef" }];
      Enrollment.find = jest.fn().mockResolvedValue(fakeEnrollments);

      // Call the controller method
      await EnrollmentController.getAllEnrollments(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeEnrollments);
    });

    test("should handle errors", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Enrollment.find() method to throw an error
      const errorMessage = "Internal Server Error";
      Enrollment.find = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Call the controller method
      await EnrollmentController.getAllEnrollments(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
