import logger from "../utils/logger.mjs";
import Room from "../models/room.mjs";

const RoomController = {
  // Method to create a new Room
  createRoom: async (req, res) => {
    // Destructuring request body to extract Room details
    const { roomNo, description, building, floor, noOfSeats } = req.body;

    // Validation for required fields
    if (!roomNo || !description || !building || !floor || !noOfSeats) {
      return res.status(422).json({ Error: "Fill in all details" });
    }

    try {
      // Checking if the Room already exists
      const preRoom = await Room.findOne({ roomNo });

      if (preRoom) {
        return res.status(422).json({ Error: "This Room already exists" });
      }

      // Creating a new Room object
      const room = new Room({
        roomNo,
        description,
        building,
        floor,
        noOfSeats,
      });

      // Saving the Room to the database
      await room.save();

      // Responding with the Room object
      res.status(201).json(room);
      logger.info(`Room created successfully`);
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res.status(400).send({ message: `Error creating Room`, error });
      logger.error(error);
    }
  },

  // Method to get all rooms
  getAllRooms: async (req, res) => {
    try {
      const rooms = await Room.find();
      res.status(200).json(rooms);
      logger.info(`Room details fetched`);
    } catch (error) {
      res.status(500).json({ message: error });
      logger.error(`Error getting all Rooms ${error.message}`);
    }
  },

  // Method to update Room details by ID
  updateRoomById: async (req, res) => {
    try {
      const updateRoom = req.body;

      // Define fields that should not be updated
      const unupdatableFields = ["roomNo"];

      // Check if any unupdatable fields are present in the request body
      const invalidFields = Object.keys(updateRoom).filter((key) =>
        unupdatableFields.includes(key)
      );

      // If any unupdatable fields are found, respond with an error message
      if (invalidFields.length > 0) {
        return res.status(422).json({
          Error: `Fields ${invalidFields.join(", ")} cannot be updated`,
        });
      }

      // Filter out unupdatable fields from the update object
      const filteredUpdate = Object.keys(updateRoom)
        .filter((key) => !unupdatableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateRoom[key];
          return obj;
        }, {});

      // Update Room details in the database
      const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        filteredUpdate,
        { new: true }
      );

      // Send success response with updated Room details
      res.status(200).send({
        message: "Room details updated successfully",
        updatedRoom,
      });
      logger.info(`Room details updated successfully`);
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Room update failed" }, error);
    }
  },

  // Method to delete Room by ID
  deleteRoomById: async (req, res) => {
    try {
      // Delete Room from the database
      await Room.findByIdAndDelete(req.params.id).then(() => {
        res.status(200).send({ message: "Room deleted successfully" }); // Send success message to the frontend
        logger.info(`Room deleted successfully`);
      });
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Room delete failed", error });
    }
  },

  // Method to get Room details by ID
  getRoombyId: async (req, res) => {
    let id = req.params.id; // Get the ID from the request parameter

    await Room.findOne({ _id: `${id}` }) // Compare the ID with the requested ID and return the details
      .then((room) => {
        res.status(200).send({ status: "Room Details fetched", room }); // Send response as a JSON object and a status
        logger.info("Room Details fetched");
      })
      .catch((err) => {
        logger.error(err.message);

        res.status(500).send({
          status: "Error with fetching Room details",
          error: err.message,
        }); // Send error message
      });
  },
};

// Export RoomController object
export default RoomController;
