import mongoose from "mongoose";
const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User", // Assuming User model is referenced for students
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
});

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);

export default Enrollment;
