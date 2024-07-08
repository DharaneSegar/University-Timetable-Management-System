import Booking from "../models/booking.mjs";
import logger from "../utils/logger.mjs";
import Room from "../models/room.mjs";
import Resource from "../models/resource.mjs";
import Timetable from "../models/timetable.mjs";
import User from "../models/user.mjs";

const BookingController = {
  // Method to create a Booking entry
  createBookingEntry: async (req, res) => {
    try {
      const {
        userId,
        reason,
        dayOfWeek,
        startTime,
        endTime,
        roomId,
        resourceId,
      } = req.body;

      // Check if the user is valid
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the room is available
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Check if the resource is available
      if (resourceId) {
        const resource = await Resource.findById(resourceId);
        if (!resource) {
          return res.status(404).json({ message: "Resource not found" });
        }
      }

      // Check for existing bookings
      const existingBookingEntry = await Booking.findOne({
        roomId,
        dayOfWeek,
        $or: [
          {
            $and: [
              { startTime: { $lte: startTime } },
              { endTime: { $gte: startTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lte: endTime } },
              { endTime: { $gte: endTime } },
            ],
          },
        ],
      });

      if (existingBookingEntry) {
        return res
          .status(409)
          .json({ message: "Room already booked for the specified time" });
      }

      // Check for conflicting timetable entries
      const conflictingTimetableEntry = await Timetable.findOne({
        roomId,
        dayOfWeek,
        $or: [
          {
            $and: [
              { startTime: { $lte: startTime } },
              { endTime: { $gte: startTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lte: endTime } },
              { endTime: { $gte: endTime } },
            ],
          },
        ],
      });

      if (conflictingTimetableEntry) {
        return res.status(409).json({
          message: "Room already booked for a course for the specified time",
        });
      }

      // Create and save the booking entry
      const bookingEntry = new Booking({
        userId,
        reason,
        dayOfWeek,
        startTime,
        endTime,
        roomId,
        resourceId,
      });

      await bookingEntry.save();

      // Respond with the booking entry object
      res
        .status(201)
        .json({ message: "Booking created successfully", bookingEntry });
      logger.info(`Booking created successfully`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
      logger.error(error);
    }
  },

  // Method to get a Booking entry by user ID
  getBookingEntriesByuserId: async (req, res) => {
    try {
      const userId = req.params.userId;

      // Find all Booking entries for the given course ID
      const bookingEntries = await Booking.find({
        userId: `${userId}`,
      });

      // If no Booking entries are found, return a 404 status code with a message
      if (!bookingEntries || bookingEntries.length === 0) {
        return res.status(404).json({
          message: "No Booking entries found for the provided course ID",
        });
      }

      // Respond with the Booking entries found
      res.status(200).json(bookingEntries);
      logger.info(`Booking entries for user ID ${userId} fetched successfully`);
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res
        .status(500)
        .send({ message: `Error retrieving booking entries`, error });
      logger.error(error);
    }
  },

  // Method to update a Booking entry by ID
  updateBookingEntryById: async (req, res) => {
    try {
      const updateBookingEntry = req.body;

      // Check if the room is available
      if (updateBookingEntry.roomId) {
        const room = await Room.findOne({ _id: updateBookingEntry.roomId });
        if (!room) {
          return res.status(404).json({ message: "Room not found" });
        }
      }

      // Check if the resource is available
      if (updateBookingEntry.resourceId) {
        const resource = await Resource.findById(updateBookingEntry.resourceId);
        if (!resource) {
          return res.status(404).json({ message: "Resource not found" });
        }
      }

      // Check if there's already a conflicting booking entry
      const conflictingEntry = await Booking.findOne({
        _id: { $ne: req.params.id }, // Exclude the current Booking entry
        roomId: updateBookingEntry.roomId,
        dayOfWeek: updateBookingEntry.dayOfWeek,
        $or: [
          {
            $and: [
              { startTime: { $lte: updateBookingEntry.startTime } },
              { endTime: { $gte: updateBookingEntry.startTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lte: updateBookingEntry.endTime } },
              { endTime: { $gte: updateBookingEntry.endTime } },
            ],
          },
        ],
      });
      if (conflictingEntry) {
        return res
          .status(409)
          .json({ message: "Room already booked for the specified time" });
      }

      // Update the Booking entry with all fields present in req.body
      const updatedBookingEntry = await Booking.findByIdAndUpdate(
        req.params.id,
        updateBookingEntry,
        { new: true }
      );

      // Respond with success message
      res.status(200).json({
        message: "Booking entry updated successfully",
        updatedBookingEntry,
      });
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .send({ message: "Failed to update Booking entry", error });
    }
  },

  // Method to delete a Booking entry by ID
  deleteBookingEntryById: async (req, res) => {
    try {
      // Delete Booking entry from the database
      await Booking.findByIdAndDelete(req.params.id);

      res.status(200).send({ message: "Booking entry deleted successfully" });
      logger.info(`Booking entry deleted successfully`);
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Booking entry delete failed", error });
    }
  },

  // Method to get a Booking entry by ID
  getBookingEntryById: async (req, res) => {
    try {
      const bookingEntry = await Booking.findById(req.params.id);

      if (!bookingEntry) {
        return res.status(404).send({ message: "Booking entry not found" });
      }

      res.status(200).json(bookingEntry);
      logger.info(`Booking entry details fetched`);
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .send({ message: "Error getting Booking entry details", error });
    }
  },

  // Method to get all Booking entries
  getAllBookingEntries: async (req, res) => {
    try {
      const bookingEntries = await Booking.find();
      res.status(200).json(bookingEntries);
      logger.info(`All Booking entries fetched`);
    } catch (error) {
      logger.error(`Error getting all Booking entries: ${error}`);
      res.status(500).json({ message: "Error getting all Booking entries" });
    }
  },
};

export default BookingController;
