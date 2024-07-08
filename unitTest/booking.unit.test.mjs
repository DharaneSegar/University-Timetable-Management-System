import BookingController from "../controllers/bookingController";
import Booking from "../models/booking.mjs";
import Room from "../models/room.mjs";
import User from "../models/user.mjs";

jest.mock("../models/booking.mjs");
jest.mock("../models/room.mjs");
jest.mock("../models/resource.mjs");
jest.mock("../models/timetable.mjs");
jest.mock("../models/user.mjs");

describe("BookingController", () => {
  let createdBookingId;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBookingEntry", () => {
    test("should create a booking entry successfully", async () => {
      const req = {
        body: {
          userId: "65fac7da28c6ea39c3d3a889",
          reason: "Presentation",
          dayOfWeek: "Friday",
          startTime: "9:00 AM",
          endTime: "10:00 AM",
          roomId: "65fd2adfbe4a2939c34ee334",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        _id: "65fac7da28c6ea39c3d3a889",
      };
      User.findById.mockResolvedValue(mockUser);

      const mockRoom = {
        _id: "65fd2adfbe4a2939c34ee334",
      };
      Room.findById.mockResolvedValue(mockRoom);

      const mockBooking = {
        _id: "generatedBookingId", // Sample ID for demonstration
        save: jest.fn().mockResolvedValue(),
      };
      Booking.mockImplementation(() => mockBooking);

      await BookingController.createBookingEntry(req, res);

      expect(User.findById).toHaveBeenCalledWith("65fac7da28c6ea39c3d3a889");
      expect(Room.findById).toHaveBeenCalledWith("65fd2adfbe4a2939c34ee334");
      expect(Booking).toHaveBeenCalledWith({
        userId: "65fac7da28c6ea39c3d3a889",
        reason: "Presentation",
        dayOfWeek: "Friday",
        startTime: "9:00 AM",
        endTime: "10:00 AM",
        roomId: "65fd2adfbe4a2939c34ee334",
      });
      expect(mockBooking.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Booking created successfully",
        bookingEntry: mockBooking,
      });

      // Store the created booking's ID
      createdBookingId = mockBooking._id;
    });
  });

  describe("updateBookingById", () => {
    test("should update Booking details by ID", async () => {
      // Mock request and response objects
      const req = {
        body: {
          reason: "Presentation rehearsal",
        },
        params: {
          id: createdBookingId, // Use a sample booking ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Booking.findByIdAndUpdate to resolve with the updated booking
      const mockUpdatedBooking = {
        _id: createdBookingId,
        reason: "Presentation rehearsal",
        // Include other fields as needed
      };
      Booking.findByIdAndUpdate.mockResolvedValue(mockUpdatedBooking);

      // Call the controller method
      await BookingController.updateBookingEntryById(req, res);

      // Assertions
      expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
        createdBookingId,
        { reason: "Presentation rehearsal" }, // Check that reason is updated
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Booking entry updated successfully",
        updatedBookingEntry: mockUpdatedBooking,
      });
    });
  });

  describe("deleteBookingEntryById", () => {
    test("should delete a Booking entry by ID", async () => {
      const req = {
        params: {
          id: createdBookingId,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock Timetable.findByIdAndDelete to resolve successfully
      Booking.findByIdAndDelete.mockResolvedValueOnce();

      await BookingController.deleteBookingEntryById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Booking entry deleted successfully",
      });
    });
  });

  describe("getAllBookingEntries", () => {
    test("should get all Booking entries", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const fakeBookingEntries = [{ dayOfWeek: "Friday" }];

      // Mock Timetable.find to resolve with fakeTimetableEntries
      Booking.find.mockResolvedValueOnce(fakeBookingEntries);

      await BookingController.getAllBookingEntries(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeBookingEntries);
    });
  });
});
