import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TimetableSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
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

const Timetable = mongoose.model("Timetable", TimetableSchema);

export default Timetable;
