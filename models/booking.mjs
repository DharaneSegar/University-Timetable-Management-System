import mongoose from "mongoose";
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: "Resource",
  },
});

const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;
