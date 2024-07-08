import logger from "../utils/logger.mjs";
import Resource from "../models/resource.mjs";
import Room from "../models/room.mjs";

const ResourceController = {
  // Method to create a new Resource
  createResource: async (req, res) => {
    // Destructuring request body to extract Resource details
    const { resourceNo, name, description, location } = req.body;

    // Validation for required fields
    if (!resourceNo || !name || !description || !location) {
      return res.status(422).json({ Error: "Fill in all details" });
    }

    try {
      // Checking if the Room exists
      const room = await Room.findOne({ roomNo: location });

      if (!room) {
        return res.status(422).json({ Error: "Invalid location" });
      }

      // Creating a new Resource object
      const resource = new Resource({
        resourceNo,
        name,
        description,
        location: room._id, // Assigning the ObjectId of the found room
      });

      // Saving the Resource to the database
      await resource.save();

      // Responding with the Resource object
      res.status(201).json(resource);
      logger.info(`Resource created successfully`);
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res.status(400).send({
        message: `Error creating Resource. Resource No already available`,
        error,
      });
      logger.error(error);
    }
  },

  // Method to get all resources
  getAllResources: async (req, res) => {
    try {
      const resources = await Resource.find();
      res.status(200).json(resources);
      logger.info(`Resource details fetched`);
    } catch (error) {
      res.status(500).json({ message: error });
      logger.error(`Error getting all Resources ${error.message}`);
    }
  },

  // Method to update Resource details by ID
  updateResourceById: async (req, res) => {
    try {
      const updateResource = req.body;

      // Define fields that should not be updated
      const unupdatableFields = ["resourceNo"];

      // Check if any unupdatable fields are present in the request body
      const invalidFields = Object.keys(updateResource).filter((key) =>
        unupdatableFields.includes(key)
      );

      // If any unupdatable fields are found, respond with an error message
      if (invalidFields.length > 0) {
        return res.status(422).json({
          Error: `Fields ${invalidFields.join(", ")} cannot be updated`,
        });
      }

      // Filter out unupdatable fields from the update object
      const filteredUpdate = Object.keys(updateResource)
        .filter((key) => !unupdatableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateResource[key];
          return obj;
        }, {});

      // Update Resource details in the database
      const updatedResource = await Resource.findByIdAndUpdate(
        req.params.id,
        filteredUpdate,
        { new: true }
      );

      // Send success response with updated Resource details
      res.status(200).send({
        message: "Resource details updated successfully",
        updatedResource,
      });
      logger.info(`Resource details updated successfully`);
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Resource update failed" }, error);
    }
  },

  // Method to delete Resource by ID
  deleteResourceById: async (req, res) => {
    try {
      // Delete Resource from the database
      await Resource.findByIdAndDelete(req.params.id).then(() => {
        res.status(200).send({ message: "Resource deleted successfully" }); // Send success message to the frontend
        logger.info(`Resource deleted successfully`);
      });
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "Resource delete failed", error });
    }
  },

  // Method to get Resource details by ID
  getResourcebyId: async (req, res) => {
    let id = req.params.id; // Get the ID from the request parameter

    await Resource.findOne({ _id: `${id}` }) // Compare the ID with the requested ID and return the details
      .then((resource) => {
        res.status(200).send({ status: "Resource Details fetched", resource }); // Send response as a JSON object and a status
        logger.info("Resource Details fetched");
      })
      .catch((err) => {
        logger.error(err.message);

        res.status(500).send({
          status: "Error with fetching Resource details",
          error: err.message,
        }); // Send error message
      });
  },
};

// Export ResourceController object
export default ResourceController;
