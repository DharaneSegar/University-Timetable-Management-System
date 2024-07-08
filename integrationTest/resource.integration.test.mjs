import jwt from "jsonwebtoken";
import request from "supertest";
import Resource from "../models/resource.mjs";
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
describe("Resource API", () => {
  let token;
  let createdResourceId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the Resource created during testing
    if (createdResourceId) {
      await Resource.findByIdAndDelete(createdResourceId);
    }

    server.close();
  });

  test("GET /resource should return all the Resources", async () => {
    // Make a request to get all Resources with the admin JWT token

    const response = await request(server)
      .get("/resource")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("POST /resource/add should create a new Resource", async () => {
    const newResource = {
      resourceNo: "P106",
      name: "Projector",
      description: "Presentations",
      location: "A101",
    };

    // Make the request with the generated token included in the headers
    const response = await request(server)
      .post("/resource")
      .set("Authorization", `Bearer ${token}`) // Include the JWT token in the Authorization header
      .send(newResource)
      .expect(201);

    createdResourceId = response.body._id;

    expect(response.body.name).toEqual(newResource.name);
  });

  test("PUT /resource/update/:id should update a Resource by ID", async () => {
    // Define updated Resource data
    const updatedResourceData = {
      description: "Can do Presentations",
    };

    // Make the request to update the Resource
    const response = await request(server)
      .put(`/resource/${createdResourceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedResourceData)
      .expect(200);

    // Assertions
    expect(response.body.updatedResource.description).toEqual(
      updatedResourceData.description
    );
  });

  test("DELETE /resource/delete/:id should delete a Resource by ID", async () => {
    // Make the request to delete the Resource
    const response = await request(server)
      .delete(`/resource/${createdResourceId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual("Resource deleted successfully");

    // Check if the Resource has been deleted from the database
    const deletedResource = await Resource.findById(createdResourceId);
    expect(deletedResource).toBeNull();
  });
});
