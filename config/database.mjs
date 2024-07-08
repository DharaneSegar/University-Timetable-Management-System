import dotenv from "dotenv";
import logger from "../utils/logger.mjs";
import mongoose from "mongoose";

dotenv.config();
const URL = process.env.MONGODB_URL;

const databaseConnection = () => {
  mongoose.connect(URL);
  mongoose.set("strictQuery", true);

  const connection = mongoose.connection;
  connection.once("open", () => {
    logger.info(`Database Connection Success`);
  });
};

export default databaseConnection;
