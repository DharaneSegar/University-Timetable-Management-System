import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["student", "admin", "faculty"], // Allowed values for the "role" field in lowercase
    lowercase: true, // Automatically convert input to lowercase
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  joinedDate: {
    type: Date,
    required: true,
  },
  enrolledCourses: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
