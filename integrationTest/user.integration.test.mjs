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
describe("User API", () => {
  let token;
  let createdUserId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the user created during testing
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }

    server.close();
  });

  test("GET /user should return all the users", async () => {
    // Make a request to get all users with the admin JWT token

    const response = await request(server)
      .get("/user")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /user/add should create a new user", async () => {
    const newUser = {
      firstname: "Mark",
      lastname: "Nick",
      email: "marknick1@gmail.com",
      password: "asdQWE#123",
      nic: "223656771",
      role: "faculty",
      address: "123 Main St",
      phone: "123-456-7890",
      dob: "1990-01-01",
      joinedDate: "2021-06-01",
    };

    // Make the request with the generated token included in the headers
    const response = await request(server)
      .post("/user")
      .set("Authorization", `Bearer ${token}`) // Include the JWT token in the Authorization header
      .send(newUser)
      .expect(201);

    createdUserId = response.body._id;

    expect(response.body.firstname).toEqual(newUser.firstname);
    expect(response.body.lastname).toEqual(newUser.lastname);
    expect(response.body.email).toEqual(newUser.email);
    expect(response.body.nic).toEqual(newUser.nic);
    expect(response.body.role).toEqual(newUser.role.toLowerCase()); // role should be lowercase
  });

  test("PUT /user/update/:id should update a user by ID", async () => {
    // Define updated user data
    const updatedUserData = {
      address: "789 Oak St",
    };

    // Make the request to update the user
    const response = await request(server)
      .put(`/user/${createdUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedUserData)
      .expect(200);

    // Assertions
    expect(response.body.updatedUser.address).toEqual(updatedUserData.address);
  });

  test("DELETE /user/delete/:id should delete a user by ID", async () => {
    // Make the request to delete the user
    const response = await request(server)
      .delete(`/user/${createdUserId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual("User deleted successfully");

    // Check if the user has been deleted from the database
    const deletedUser = await User.findById(createdUserId);
    expect(deletedUser).toBeNull();
  });
});
