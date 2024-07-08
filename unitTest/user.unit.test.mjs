import User from "../models/user.mjs";
import UserController from "../controllers/userController.mjs";

jest.mock("../utils/logger.mjs", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("UserController", () => {
  let createdUserId;
  describe("createUser", () => {
    test("should create a new user", async () => {
      // Mock request and response objects
      const req = {
        body: {
          firstname: "Thomas",
          lastname: "Paul",
          email: "tpaul@gmail.com",
          password: "asdQWE#123",
          nic: "223956785",
          role: "faculty",
          address: "456 Main St",
          phone: "123-456-7890",
          dob: "1990-01-01",
          joinedDate: "2021-06-01",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock database functions and user save method

      User.findOne = jest.fn().mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(req.body);
      User.prototype.save = saveMock;

      // Call the controller method
      await UserController.createUser(req, res);

      createdUserId = res.json.mock.calls[0][0]._id;

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("updateUserById", () => {
    test("should update user details by ID", async () => {
      // Mock request and response objects
      const req = {
        body: {
          address: "789 Oak St",
        },
        params: {
          id: createdUserId, // Use the created user's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(null); // No conflicting entry
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(req.body);

      // Call the controller method
      await UserController.updateUserById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "User details updated successfully",
        updatedUser: req.body,
      });
    });
  });

  describe("deleteUserById", () => {
    test("should delete user by ID", async () => {
      // Mock request and response objects
      const req = {
        params: {
          id: createdUserId, // Use the created user's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock Booking.findByIdAndDelete method
      User.findByIdAndDelete = jest.fn().mockResolvedValueOnce();

      // Call the controller method
      await UserController.deleteUserById(req, res);

      // Assertions
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });
  });

  describe("getAllUsers", () => {
    test("should get all users", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock User.find() method
      const fakeUsers = [
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
      ];
      User.find = jest.fn().mockResolvedValue(fakeUsers);

      // Call the controller method
      await UserController.getAllUsers(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeUsers);
    });

    test("should handle errors", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock User.find() method to throw an error
      const errorMessage = "Internal Server Error";
      User.find = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Call the controller method
      await UserController.getAllUsers(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
