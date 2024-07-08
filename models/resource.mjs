import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
  resourceNo: {
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
  location: {
    type: Schema.Types.ObjectId, // Reference to Room model's ObjectId
    ref: "Room", // Referring to the Room model
    required: true,
  },
});

const Resource = mongoose.model("Resource", ResourceSchema);

export default Resource;
