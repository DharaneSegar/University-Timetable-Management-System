import Course from "../models/course.mjs";
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
describe("Course API", () => {
  let token;
  let createdCourseId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the Course created during testing
    if (createdCourseId) {
      await Course.findByIdAndDelete(createdCourseId);
    }

    server.close();
  });

  test("GET /course should return all the Courses", async () => {
    // Make a request to get all Courses with the admin JWT token

    const response = await request(server)
      .get("/course")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /course/add should create a new Course", async () => {
    const newCourse = {
      code: "IT105",
      name: "Introduction to Computer Systems",
      description:
        "An introductory course covering basic concepts in computer science.",
      credits: 4,
    };

    // Make the request with the generated token included in the headers
    const response = await request(server)
      .post("/course")
      .set("Authorization", `Bearer ${token}`) // Include the JWT token in the Authorization header
      .send(newCourse)
      .expect(201);

    createdCourseId = response.body._id;

    expect(response.body.code).toEqual(newCourse.code);
    expect(response.body.name).toEqual(newCourse.name);
  });

  test("PUT /course/:id should update a Course by ID", async () => {
    // Define updated Course data
    const updatedCourseData = {
      credits: 3,
    };

    // Make the request to update the Course
    const response = await request(server)
      .put(`/course/${createdCourseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCourseData)
      .expect(200);

    // Assertions
    expect(response.body.updatedCourse.credits).toEqual(
      updatedCourseData.credits
    );
  });

  test("DELETE /course/delete/:id should delete a Course by ID", async () => {
    // Make the request to delete the Course
    const response = await request(server)
      .delete(`/course/${createdCourseId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual("Course deleted successfully");

    // Check if the Course has been deleted from the database
    const deletedCourse = await Course.findById(createdCourseId);
    expect(deletedCourse).toBeNull();
  });
});
