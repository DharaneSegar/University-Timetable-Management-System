import Booking from "../models/booking.mjs";
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

describe("Booking API", () => {
  let token;
  let createdBookingId;

  beforeAll(async () => {
    // Generate token before running tests
    token = await generateToken();
  });

  afterAll(async () => {
    // Clean up: Delete the Booking created during testing
    if (createdBookingId) {
      await Booking.findByIdAndDelete(createdBookingId);
    }
    server.close();
  });

  test("GET /booking should return all the Enrollments", async () => {
    // Make a request to get all Enrollments with the admin JWT token

    const response = await request(server)
      .get("/booking")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  describe("POST /booking", () => {
    test("should create a booking entry successfully", async () => {
      // Mock request body
      //TODO : replace the userId and roomId with existing values

      const newBooking = {
        userId: "65fac7da28c6ea39c3d3a889",
        reason: "Presentation",
        dayOfWeek: "Friday",
        startTime: "9:00 AM",
        endTime: "10:00 AM",
        roomId: "65fd2adfbe4a2939c34ee334",
      };

      // Send POST request to create a booking entry
      const response = await request(server)
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send(newBooking)
        .expect(201);

      // Check if the bookingEntry property exists in the response body
      if (
        response.body &&
        response.body.bookingEntry &&
        response.body.bookingEntry._id
      ) {
        // Assign the created booking ID to the variable
        createdBookingId = response.body.bookingEntry._id;

        // Assertions
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Booking created successfully");
      } else {
        // Log an error if the bookingEntry property is missing
        console.error("Booking entry not found in the response body");
        // Fail the test explicitly
        fail("Booking entry not found in the response body");
      }
    });
  });

  test("PUT /booking/update/:id should update a Enrollment by ID", async () => {
    // Define updated Booking data
    const updatedBookingData = {
      dayOfWeek: "Thursday",
    };

    // Make the request to update the Booking
    const response = await request(server)
      .put(`/booking/${createdBookingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedBookingData)
      .expect(200);

    // Assertions
    expect(response.body.updatedBookingEntry.dayOfWeek).toEqual(
      updatedBookingData.dayOfWeek
    );
  });

  test("DELETE /booking/delete/:id should delete a Enrollment by ID", async () => {
    // Make the request to delete the Enrollment
    const response = await request(server)
      .delete(`/booking/${createdBookingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // Assertions
    expect(response.body.message).toEqual("Booking entry deleted successfully");

    // Check if the Enrollment has been deleted from the database
    const deletedBooking = await Booking.findById(createdBookingId);
    expect(deletedBooking).toBeNull();
  });
});
