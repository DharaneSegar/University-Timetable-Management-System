import jwt from "jsonwebtoken";
import request from "supertest";
import server from "../server.mjs";
import Timetable from "../models/timetable.mjs";
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
describe("Timetable API", () => {
  let token;
  let createdTimetableId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the Timetable created during testing
    if (createdTimetableId) {
      await Timetable.findByIdAndDelete(createdTimetableId);
    }

    server.close();
  });

  test("GET /timetable should return all the Timetables", async () => {
    // Make a request to get all Timetables with the admin JWT token

    const response = await request(server)
      .get("/timetable")
      .set("Authorization", `Bearer ${token}`);
    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /timetable/add should create a new Timetable", async () => {
    //TODO : replace the courseId,roomId and resourceId with existing values
    const newTimetable = {
      courseId: "65facb7b2da33e0979ec12ef",
      dayOfWeek: "Wednesday",
      startTime: "09:00",
      endTime: "11:00",
      roomId: "65fd2adfbe4a2939c34ee334",
      resourceId: "65fd402d21f8f1b277daf013",
    };

    // Make the request with the generated token included in the headers
    const response = await request(server)
      .post("/timetable")
      .set("Authorization", `Bearer ${token}`) // Include the JWT token in the Authorization header
      .send(newTimetable)
      .expect(201);

    // Ensure that the response contains the created Timetable entry
    expect(response.body).toBeDefined();
    expect(response.body._id).toBeDefined();

    // Assign the created Timetable ID to the variable
    createdTimetableId = response.body._id;

    // Assertions
    expect(response.body.courseId).toEqual(newTimetable.courseId);
    expect(response.body.dayOfWeek).toEqual(newTimetable.dayOfWeek);
  });

  test("PUT /timetable/update/:id should update a Timetable by ID", async () => {
    // Define updated Timetable data
    const updatedTimetableData = {
      startTime: "10:00",
    };

    // Make the request to update the Timetable
    const response = await request(server)
      .put(`/timetable/${createdTimetableId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedTimetableData)
      .expect(200);

    // Assertions
    expect(response.body.updatedTimetableEntry.startTime).toEqual(
      updatedTimetableData.startTime
    );
  });

  test("DELETE /timetable/delete/:id should delete a Timetable by ID", async () => {
    // Make the request to delete the Timetable
    const response = await request(server)
      .delete(`/timetable/${createdTimetableId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual(
      "Timetable entry deleted successfully"
    );

    // Check if the Timetable has been deleted from the database
    const deletedTimetable = await Timetable.findById(createdTimetableId);
    expect(deletedTimetable).toBeNull();
  });
});
