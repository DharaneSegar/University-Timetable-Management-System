import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.mjs";
import nodemailer from "nodemailer";
import User from "../models/user.mjs";

// Set up JWT secret key
dotenv.config();
const JWT = process.env.JWT_SECRET;

const UserController = {
  // Method to create a new user
  createUser: async (req, res) => {
    // Destructuring request body to extract user details
    const {
      firstname,
      lastname,
      email,
      password,
      nic,
      role,
      address,
      phone,
      dob,
      joinedDate,
    } = req.body;

    // Validation for required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !nic ||
      !role ||
      !address ||
      !phone ||
      !dob ||
      !joinedDate
    ) {
      return res.status(422).json({ Error: "Fill in all details" });
    }

    // Convert role to lowercase for case-insensitive check
    const lowercaseRole = role.toLowerCase();

    // Check if the role is one of the allowed values
    if (
      lowercaseRole !== "student" &&
      lowercaseRole !== "admin" &&
      lowercaseRole !== "faculty"
    ) {
      return res.status(422).json({
        Error: "Invalid role. Role must be Student, Admin, or Faculty",
      });
    }

    // Password validity checks
    if (password.length < 8) {
      return res
        .status(422)
        .json({ Error: "Password must be at least 8 characters long" });
    }

    // Regex patterns for password complexity
    const regexUpperCase = /[A-Z]/;
    const regexLowerCase = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const regexNumber = /\d/;

    if (!regexUpperCase.test(password)) {
      return res
        .status(422)
        .json({ Error: "Password must contain at least one uppercase letter" });
    }

    if (!regexLowerCase.test(password)) {
      return res
        .status(422)
        .json({ Error: "Password must contain at least one lowercase letter" });
    }

    if (!regexSpecialChar.test(password)) {
      return res.status(422).json({
        Error: "Password must contain at least one special character",
      });
    }

    if (!regexNumber.test(password)) {
      return res
        .status(422)
        .json({ Error: "Password must contain at least one number" });
    }

    try {
      // Checking if the user already exists
      const preuser = await User.findOne({ email });

      if (preuser) {
        return res.status(422).json({ Error: "This user already exists" });
      }

      // Creating a new user object
      const user = new User({
        firstname,
        lastname,
        email,
        password,
        nic,
        role: lowercaseRole, // Save role in lowercase to ensure consistency
        address,
        phone,
        dob,
        joinedDate,
      });

      // Hash the password asynchronously
      const hashedPassword = await bcrypt.hash(password, 12);

      // Assigning hashed password to the user object
      user.password = hashedPassword;

      // Saving the user to the database
      await user.save();

      // Responding with the user object
      res.status(201).json(user);
      logger.info(`User created successfully`);
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      res.status(400).send({ message: `Error creating User`, error });
      logger.error(error);
    }
  },

  // Method to get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
      logger.info(`User details fetched`);
    } catch (error) {
      res.status(500).json({ message: error });
      logger.error(`Error getting all users ${error.message}`);
    }
  },

  // Method for user login
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Check if user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Email is not registered" });
      }

      // Compare passwords
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid Password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT,
        { expiresIn: "7d" }
      );

      // Send success response with token and user details

      res.status(200).json({
        success: true,
        message: "Login successful",
        user,
        token,
      });
    } catch (error) {
      console.error("Login failed:", error);
      res
        .status(500)
        .json({ success: false, message: "Error in login", error });
    }
  },

  // Method to update user details by ID
  updateUserById: async (req, res) => {
    try {
      const updateUser = req.body;

      // Define fields that should not be updated
      const unupdatableFields = ["email", "role", "nic", "dob", "joinedDate"];

      // Check if any unupdatable fields are present in the request body
      const invalidFields = Object.keys(updateUser).filter((key) =>
        unupdatableFields.includes(key)
      );

      // If any unupdatable fields are found, respond with an error message
      if (invalidFields.length > 0) {
        return res.status(422).json({
          Error: `Fields ${invalidFields.join(", ")} cannot be updated`,
        });
      }

      // Filter out unupdatable fields from the update object
      const filteredUpdate = Object.keys(updateUser)
        .filter((key) => !unupdatableFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateUser[key];
          return obj;
        }, {});

      // Update user details in the database
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        filteredUpdate,
        { new: true }
      );

      // Send success response with updated user details
      res.status(200).send({
        message: "User details updated successfully",
        updatedUser,
      });
      logger.info(`User details updated successfully`);
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "User update failed" }, error);
    }
  },

  // Method to delete user by ID
  deleteUserById: async (req, res) => {
    try {
      // Delete user from the database
      await User.findByIdAndDelete(req.params.id).then(() => {
        res.status(200).send({ message: "User deleted successfully" }); // Send success message to the frontend
        logger.info(`User deleted successfully`);
      });
    } catch (error) {
      logger.error(error);
      res.status(400).send({ message: "User delete failed", error });
    }
  },

  // Method to get user details by ID
  getUserbyId: async (req, res) => {
    let id = req.params.id; // Get the ID from the request parameter

    await User.findOne({ _id: `${id}` }) // Compare the ID with the requested ID and return the details
      .then((user) => {
        res.status(200).send({ status: "User Details fetched", user }); // Send response as a JSON object and a status
        logger.info("User Details fetched");
      })
      .catch((err) => {
        logger.error(err.message);

        res.status(500).send({
          status: "Error with fetching User details",
          error: err.message,
        }); // Send error message
      });
  },

  // Method to handle forgot password functionality
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ Status: "User not found" });
      }

      // Create transporter for sending email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.APP_PASSWORD,
        },
        tls: {
          // Allow self-signed certificates
          rejectUnauthorized: false,
        },
      });

      // Email options
      const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: "Reset Password Link",
        text: `http://localhost:8080/user/reset/${user._id}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error:", error);
          return res.status(500).json({ Status: "Error sending email" });
        } else {
          console.log("Email sent:", info.response);
          return res
            .status(200)
            .json({ message: "Success", Link: mailOptions.text });
        }
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ Status: "Internal Server Error" });
    }
  },

  // Method to reset user password
  resetPassword: async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Password validity checks
    if (password.length < 8) {
      return res
        .status(422)
        .json({ Error: "Password must be at least 8 characters long" });
    }

    // Regex patterns for password complexity
    const regexUpperCase = /[A-Z]/;
    const regexLowerCase = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const regexNumber = /\d/;

    if (!regexUpperCase.test(password)) {
      return res
        .status(422)
        .json({ Error: "Password must contain at least one uppercase letter" });
    }

    if (!regexLowerCase.test(password)) {
      return res
        .status(422)
        .json({ Error: "Password must contain at least one lowercase letter" });
    }

    if (!regexSpecialChar.test(password)) {
      return res.status(422).json({
        Error: "Password must contain at least one special character",
      });
    }

    if (!regexNumber.test(password)) {
      return res
        .status(422)
        .json({ Error: "Password must contain at least one number" });
    }

    // Hash the new password
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password in the database
      await User.findByIdAndUpdate({ _id: id }, { password: hashedPassword });

      // Send success response
      res.status(200).send({ message: "Password reset successfully" });
      logger.info("Password updated successfully");
    } catch (error) {
      logger.error(error);
      res.status(500).send({ Error: "Password reset failed", error });
    }
  },
};

// Export UserController object
export default UserController;
