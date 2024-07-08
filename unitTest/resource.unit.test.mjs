import Resource from "../models/resource.mjs";
import ResourceController from "../controllers/resourceController.mjs";
import Room from "../models/room.mjs";

jest.mock("../utils/logger.mjs", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

beforeEach(() => {
  Resource.findOne = jest.fn();
  Room.findOne = jest.fn();
  Resource.prototype.save = jest.fn();
});

describe("ResourceController", () => {
  let createdResourceId;
  describe("createResource", () => {
    test("should create a new Resource", async () => {
      // Mock request and response objects
      const req = {
        body: {
          resourceNo: "P205",
          name: "Projector",
          description: "Presentations",
          location: "F101",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      // Mock Room.findOne to return a room
      Room.findOne.mockResolvedValue({ _id: "roomId" });

      // Define a variable to store the created resource ID
      let createdResourceId;

      // Mock Resource save method
      Resource.prototype.save.mockImplementationOnce(async () => {
        const createdResource = {
          _id: "resourceId",
          ...req.body, // Include other properties from request body
        };
        createdResourceId = createdResource._id; // Store the _id in the variable
        return createdResource;
      });

      // Call the controller method
      await ResourceController.createResource(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(createdResourceId).toEqual("resourceId");
    });
  });

  describe("updateResourceById", () => {
    test("should update Resource details by ID", async () => {
      // Mock request and response objects
      const req = {
        body: {
          description: "Can do Presentations",
        },
        params: {
          id: createdResourceId, // Use the created Resource's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      Resource.findOne = jest.fn().mockResolvedValue(null); // No conflicting entry
      Resource.findByIdAndUpdate = jest.fn().mockResolvedValue(req.body);

      // Call the controller method
      await ResourceController.updateResourceById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Resource details updated successfully",
        updatedResource: req.body,
      });
    });
  });

  describe("deleteResourceById", () => {
    test("should delete Resource by ID", async () => {
      // Mock request and response objects
      const req = {
        params: {
          id: createdResourceId, // Use the created Resource's ID
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      // Mock Booking.findByIdAndDelete method
      Resource.findByIdAndDelete = jest.fn().mockResolvedValueOnce();

      // Call the controller method
      await ResourceController.deleteResourceById(req, res);

      // Assertions
      expect(Resource.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: "Resource deleted successfully",
      });
    });
  });

  describe("getAllResources", () => {
    test("should get all Resources", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Resource.find() method
      const fakeResources = [{ resourceNo: "P105" }];
      Resource.find = jest.fn().mockResolvedValue(fakeResources);

      // Call the controller method
      await ResourceController.getAllResources(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResources);
    });

    test("should handle errors", async () => {
      // Mock request and response objects
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock Resource.find() method to throw an error
      const errorMessage = "Internal Server Error";
      Resource.find = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Call the controller method
      await ResourceController.getAllResources(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
