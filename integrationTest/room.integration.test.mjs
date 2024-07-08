import jwt from "jsonwebtoken";
import request from "supertest";
import Room from "../models/room.mjs";
import server from "../server.mjs";
import User from "../models/user.mjs";

const generateToken = async () => {
  //TODO : replace the email with a valid admin email address
  const email = "johndoe@gmail.com";

  const user = await User.findOne({ email });

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};
describe("Room API", () => {
  let token;
  let createdRoomId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the Room created during testing
    if (createdRoomId) {
      await Room.findByIdAndDelete(createdRoomId);
    }

    server.close();
  });

  test("GET /room should return all the Rooms", async () => {
    // Make a request to get all Rooms with the admin JWT token

    const response = await request(server)
      .get("/room")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /room/add should create a new Room", async () => {
    const newRoom = {
      roomNo: "A105",
      description: "Lecture hall",
      building: "Main buliding",
      floor: 7,
      noOfSeats: 200,
    };

    // Make the request with the generated token included in the headers
    const response = await request(server)
      .post("/room")
      .set("Authorization", `Bearer ${token}`) // Include the JWT token in the Authorization header
      .send(newRoom)
      .expect(201);

    createdRoomId = response.body._id;

    expect(response.body.floor).toEqual(newRoom.floor);
  });

  test("PUT /room/update/:id should update a Room by ID", async () => {
    // Define updated Room data
    const updatedRoomData = {
      floor: 5,
    };

    // Make the request to update the Room
    const response = await request(server)
      .put(`/room/${createdRoomId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedRoomData)
      .expect(200);

    // Assertions
    expect(response.body.updatedRoom.floor).toEqual(updatedRoomData.floor);
  });

  test("DELETE /room/delete/:id should delete a Room by ID", async () => {
    // Make the request to delete the Room
    const response = await request(server)
      .delete(`/room/${createdRoomId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual("Room deleted successfully");

    // Check if the Room has been deleted from the database
    const deletedRoom = await Room.findById(createdRoomId);
    expect(deletedRoom).toBeNull();
  });
});
