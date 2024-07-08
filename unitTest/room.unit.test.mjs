import Room from "../models/room.mjs";
import RoomController from "../controllers/roomController.mjs";

jest.mock("../utils/logger.mjs", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("RoomController", () => {
  let createdRoomId;
  describe("createRoom", () => {
    test("should create a new Room", async () => {
      // Mock request and response objects
      const req = {
        body: {
          roomNo: "G101",
          description: "Lecture hall",
          building: "New buliding",
          floor: 4,
          noOfSeats: 150,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      // Mock database functions and Room save method

      Room.findOne = jest.fn().mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(req.body);
      Room.prototype.save = saveMock;

      // Call the controller method
      await RoomController.createRoom(req, res);

      createdRoomId = res.json.mock.calls[0][0]._id;

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("updateRoomById", () => {
    test("should update Room details by ID", async () => {
      // Mock request and response objects
      const req = {
        body: {
          description: "Lecture hall with whiteboard",
        },
        params: {
          id: createdRoomId, // Use the created Room's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Room.findOne = jest.fn().mockResolvedValue(null); // No conflicting entry
      Room.findByIdAndUpdate = jest.fn().mockResolvedValue(req.body);

      // Call the controller method
      await RoomController.updateRoomById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteRoomById", () => {
    test("should delete Room by ID", async () => {
      // Mock request and response objects
      const req = {
        params: {
          id: createdRoomId, // Use the created Room's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock Booking.findByIdAndDelete method
      Room.findByIdAndDelete = jest.fn().mockResolvedValueOnce();

      // Call the controller method
      await RoomController.deleteRoomById(req, res);

      // Assertions
      expect(Room.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Room deleted successfully",
      });
    });
  });

  describe("getAllRooms", () => {
    test("should get all Rooms", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Room.find() method
      const fakeRooms = [{ roomNo: "A101" }];
      Room.find = jest.fn().mockResolvedValue(fakeRooms);

      // Call the controller method
      await RoomController.getAllRooms(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeRooms);
    });

    test("should handle errors", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Room.find() method to throw an error
      const errorMessage = "Internal Server Error";
      Room.find = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Call the controller method
      await RoomController.getAllRooms(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
