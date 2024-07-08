import Enrollment from "../models/enrollment.mjs";
import jwt from "jsonwebtoken";
import request from "supertest";
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
describe("Enrollment API", () => {
  let token;
  let createdEnrollmentId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the Enrollment created during testing
    if (createdEnrollmentId) {
      await Enrollment.findByIdAndDelete(createdEnrollmentId);
    }

    server.close();
  });

  test("GET /enrollment should return all the Enrollments", async () => {
    // Make a request to get all Enrollments with the admin JWT token

    const response = await request(server)
      .get("/enrollment")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST /enrollment/add should create a new Enrollment", async () => {
    const newEnrollment = {
      //TODO : replace the studentId and courseId with existing values
      studentId: "65fe91b7042056bf04dcb66e",
      courseId: "65f290d49e2e49278bfac9f5",
    };

    // Make the request with the generated token included in the headers
    const response = await request(server)
      .post("/enrollment")
      .set("Authorization", `Bearer ${token}`) // Include the JWT token in the Authorization header
      .send(newEnrollment)
      .expect(201);

    createdEnrollmentId = response.body.enrollment._id;
    expect(response.body.enrollment.course).toEqual(newEnrollment.courseId);
  });

  test("PUT /enrollment/update/:id should update a Enrollment by ID", async () => {
    // Define updated Enrollment data
    const updatedEnrollmentData = {
      courseId: "65f290d49e2e49278bfac9f5",
    };

    // Make the request to update the Enrollment
    const response = await request(server)
      .put(`/enrollment/${createdEnrollmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedEnrollmentData)
      .expect(200);

    // Assertions
    expect(response.body.updatedEnrollment.course).toEqual(
      updatedEnrollmentData.courseId
    );
  });

  test("DELETE /enrollment/delete/:id should delete a Enrollment by ID", async () => {
    // Make the request to delete the Enrollment
    const response = await request(server)
      .delete(`/enrollment/${createdEnrollmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual(
      "Student enrollment removed successfully"
    );

    // Check if the Enrollment has been deleted from the database
    const deletedEnrollment = await Enrollment.findById(createdEnrollmentId);
    expect(deletedEnrollment).toBeNull();
  });
});
