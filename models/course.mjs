import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  faculty: {
    type: String,
  },
});

const Course = mongoose.model("Course", CourseSchema);

export default Course;
