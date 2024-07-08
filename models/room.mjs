import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomNo: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  building: {
    type: String,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  noOfSeats: {
    type: Number,
    required: true,
  },
});

const Room = mongoose.model("Room", RoomSchema);

export default Room;
