import Course from "../models/course.mjs";
import Resource from "../models/resource.mjs";
import Room from "../models/room.mjs";
import Timetable from "../models/timetable.mjs";
import TimetableController from "../controllers/timetableController.mjs";

jest.mock("../models/timetable.mjs");
jest.mock("../models/room.mjs");
jest.mock("../models/resource.mjs");
jest.mock("../models/course.mjs");
jest.mock("../models/user.mjs");

describe("TimetableController", () => {
  let createdTimetableId;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTimetableEntry", () => {
    test("should create a new Timetable entry", async () => {
      const req = {
        body: {
          courseId: "6cf290d49e2e49278bfac9e5",
          dayOfWeek: "Tuesday",
          startTime: "09:00",
          endTime: "11:00",
          roomId: "65s159367c5d87d1e922f5e7",
          resourceId: "65f27b46ef65db1106vya7a01",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock dependencies
      Course.findOne.mockResolvedValueOnce({ _id: req.body.courseId });
      Room.findOne.mockResolvedValueOnce({ _id: req.body.roomId });
      Resource.findById.mockResolvedValueOnce({ _id: req.body.resourceId });
      Timetable.findOne.mockResolvedValueOnce(null);
      Timetable.prototype.save.mockResolvedValueOnce(req.body);

      await TimetableController.createTimetableEntry(req, res);

      createdTimetableId = res.json.mock.calls[0][0]._id;

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return 404 if course not found", async () => {
      const req = {
        body: {
          courseId: "invalidCourseId",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Course.findOne to return null
      Course.findOne.mockResolvedValueOnce(null);

      await TimetableController.createTimetableEntry(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Course not found",
      });
    });
  });

  describe("deleteTimetableEntryById", () => {
    test("should delete a Timetable entry by ID", async () => {
      const req = {
        params: {
          id: createdTimetableId,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock Timetable.findByIdAndDelete to resolve successfully
      Timetable.findByIdAndDelete.mockResolvedValueOnce();

      await TimetableController.deleteTimetableEntryById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Timetable entry deleted successfully",
      });
    });
  });

  describe("getAllTimetableEntries", () => {
    test("should get all Timetable entries", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const fakeTimetableEntries = [{ dayOfWeek: "Monday" }];

      // Mock Timetable.find to resolve with fakeTimetableEntries
      Timetable.find.mockResolvedValueOnce(fakeTimetableEntries);

      await TimetableController.getAllTimetableEntries(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeTimetableEntries);
    });
  });
});
