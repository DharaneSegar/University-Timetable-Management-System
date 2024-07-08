## University Timetable Management System

The University Timetable Management System is a comprehensive RESTful API designed to streamline the complexities of class scheduling, course management, and user interactions within an educational setting. With a focus on security, data integrity, and user experience, this system offers robust features including user authentication with JWT, role-based access control, CRUD operations for courses, dynamic timetable management, room and resource booking functionality to prevent overlaps, student enrollment management, and a notification system for timely updates. By adhering to software development best practices and leveraging technologies such as Express JS (Node.js) alongside MongoDB.

### Setup Instructions

1. **Clone the Repository**:

   ```
   git clone https://github.com/sliitcsse/assignment-01-DharaneSegar.git
   ```

2. **Install Dependencies**:

   ```
   cd assignment-01-DharaneSegar
   npm install
   ```

3. **Set Up Node Environment**:
   Before running the project, ensure you have Node.js installed on your system. You can download it from [Node.js website](https://nodejs.org/).

4. **Environment Variables**: Create a .env file in the root directory of the project and set any necessary environment variables. You can use the provided `.env.template.txt` file as a template

5. **Start Node**:
   To start the Node server, run:
   ```bash
   npm start
   ```

# API Endpoint Documentation

## User Management Endpoints

### Create User

- **POST /user/**
  - Description: Create a new user.
  - Authorization: Admin.
  - Request Body:
    ```json
    {
      "firstname": "string",
      "lastname": "string",
      "email": "string",
      "password": "string",
      "nic": "string",
      "role": "string",
      "address": "string",
      "phone": "string",
      "dob": "string",
      "joinedDate": "string"
    }
    ```

### User Login

- **POST /user/login**
  - Description: Log in as a user.
  - Request Body:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```

### Get All Users

- **GET /user/**
  - Description: Get all users.
  - Authorization: Admin, Faculty, or Student.

### Update User

- **PUT /user/:id**
  - Description: Update user details by ID.
  - Authorization: Admin.
  - Parameters:
    - `id`: User ID to update.
  - Request Body:
    ```json
    {
      "address": "string"
    }
    ```

### Delete User

- **DELETE /user/:id**
  - Description: Delete a user by ID.
  - Authorization: Admin.
  - Parameters:
    - `id`: User ID to delete.

### Get User by ID

- **GET /user/:id**
  - Description: Get user details by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: User ID to retrieve.

### Forgot Password

- **POST /user/forgot**
  - Description: Initiate the forgot password process.
  - Authorization: Admin, Faculty, or Student.
  - Request Body:
    ```json
    {
      "email": "string"
    }
    ```

### Reset Password

- **POST /user/reset/:id**

  - Description: Reset user password by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: User ID to reset password for.
  - Request Body:

    ```json
    {
      "password": "string"
    }
    ```

## Course Management Endpoints

### Create Course

- **POST /course/**
  - Description: Create a new course.
  - Authorization: Admin or Faculty.
  - Request Body:
    ```json
    {
      "code": "string",
      "name": "string",
      "description": "string",
      "credits": "number"
    }
    ```

### Get All Courses

- **GET /course/**
  - Description: Get all courses.
  - Authorization: Admin, Faculty, or Student.

### Update Course

- **PUT /course/:id**
  - Description: Update course details by ID.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `id`: Course ID to update.
  - Request Body:
    ```json
    {
      "description": "string"
    }
    ```

### Delete Course

- **DELETE /course/:id**
  - Description: Delete a course by ID.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `id`: Course ID to delete.

### Get Course by ID

- **GET /course/:id**
  - Description: Get course details by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: Course ID to retrieve.

### Assign Faculty to Course

- **POST /course/assignCourse**
  - Description: Assign faculty to a course.
  - Authorization: Admin.
  - Request Body:
    ```json
    {
      "facultyId": "string",
      "courseId": "string"
    }
    ```

## Resource Management Endpoints

### Create Resource

- **POST /resource/**
  - Description: Create a new resource.
  - Authorization: Admin.
  - Request Body:
    ```json
    {
      "resourceNo": "string",
      "name": "string",
      "description": "string",
      "location": "string"
    }
    ```

### Get All Resources

- **GET /resource/**
  - Description: Get all resources.
  - Authorization: Admin, Faculty, or Student.

### Update Resource

- **PUT /resource/:id**
  - Description: Update resource details by ID.
  - Authorization: Admin.
  - Parameters:
    - `id`: Resource ID to update.
  - Request Body:
    ```json
    {
      "description": "string"
    }
    ```

### Delete Resource

- **DELETE /resource/:id**
  - Description: Delete a resource by ID.
  - Authorization: Admin.
  - Parameters:
    - `id`: Resource ID to delete.

### Get Resource by ID

- **GET /resource/:id**
  - Description: Get resource details by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: Resource ID to retrieve.

## Room Management Endpoints

### Create Room

- **POST /room/**
  - Description: Create a new room.
  - Authorization: Admin.
  - Request Body:
    ```json
    {
      "roomNo": "string",
      "description": "string",
      "building": "string",
      "floor": "number",
      "noOfSeats": "number"
    }
    ```

### Get All Rooms

- **GET /room/**
  - Description: Get all rooms.
  - Authorization: Admin, Faculty, or Student.

### Update Room

- **PUT /room/:id**
  - Description: Update room details by ID.
  - Authorization: Admin.
  - Parameters:
    - `id`: Room ID to update.
  - Request Body:
    ```json
    {
      "description": "string"
    }
    ```

### Delete Room

- **DELETE /room/:id**
  - Description: Delete a room by ID.
  - Authorization: Admin.
  - Parameters:
    - `id`: Room ID to delete.

### Get Room by ID

- **GET /room/:id**
  - Description: Get room details by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: Room ID to retrieve.

## Timetable Management Endpoints

### Create Timetable Entry

- **POST /timetable/**
  - Description: Create a new timetable entry.
  - Authorization: Admin or Faculty.
  - Request Body:
    ```json
    {
      "courseId": "string",
      "dayOfWeek": "string",
      "startTime": "string",
      "endTime": "string",
      "roomId": "string",
      "resourceId": "string"
    }
    ```

### Get All Timetable Entries

- **GET /timetable/**
  - Description: Get all timetable entries.
  - Authorization: Admin, Faculty, or Student.

### Update Timetable Entry

- **PUT /timetable/:id**
  - Description: Update timetable entry details by ID.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `id`: Timetable entry ID to update.
  - Request Body:
    ```json
    {
      "dayOfWeek": "string"
    }
    ```

### Delete Timetable Entry

- **DELETE /timetable/:id**
  - Description: Delete a timetable entry by ID.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `id`: Timetable entry ID to delete.

### Get Timetable Entry by ID

- **GET /timetable/:id**
  - Description: Get timetable entry details by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: Timetable entry ID to retrieve.

### Get Timetable Entries by Course ID

- **GET /timetable/getCourse/:courseId**
  - Description: Get timetable entries for a specific course.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `courseId`: Course ID for which to retrieve timetable entries.

### View Student Timetable

- **GET /timetable/viewTimetable/:studentId**
  - Description: View timetable entries for a specific student.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `studentId`: Student ID for which to view timetable.

## Enrollment Endpoints

### Enroll Student in Course

- **POST /enrollment/**
  - Description: Enroll a student in a course.
  - Authorization: Admin, Faculty, or Student.
  - Request Body:
    ```json
    {
      "studentId": "string",
      "courseId": "string"
    }
    ```

### View Student Enrollments for Course

- **GET /enrollment/viewEnrollment/:courseId**
  - Description: View enrollments for a specific course.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `courseId`: Course ID for which to view enrollments.

### View Student Enrolled Courses

- **GET /enrollment/viewCourse/:studentId**
  - Description: View courses enrolled by a student.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `studentId`: Student ID for which to view enrolled courses.

### Update Student Enrollment

- **PUT /enrollment/:enrollmentId**
  - Description: Update student enrollment details.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `enrollmentId`: ID of the enrollment to update.
  - Request Body:
    ```json
    {
      "courseId": "string"
    }
    ```

### Remove Student Enrollment

- **DELETE /enrollment/:enrollmentId**
  - Description: Remove a student from enrollment.
  - Authorization: Admin or Faculty.
  - Parameters:
    - `enrollmentId`: ID of the enrollment to remove.

### Get All Enrollments

- **GET /enrollment**
  - Description: Get all enrollments.
  - Authorization: Admin, Faculty, or Student.

### Get Enrollment by ID

- **GET /enrollment/:id**
  - Description: Get enrollment by ID.
  - Authorization: Admin, Faculty, or Student.
  - Parameters:
    - `id`: ID of the enrollment to retrieve.

## Running Tests

Before running the test cases, please ensure that any TODOs mentioned in the test files as comments inside the `integrationTest` and `performanceTest` folders have been addressed.

### Jest Unit Tests

To run Jest unit tests, execute the following command:

```bash
npm test
```

### Supertest Integration Tests

To run Supertest integration tests, execute the following command:

```bash
npm test
```

### artillery.io Performance Tests

To run artillery.io performance tests, execute the following command:

```
cd assignment-01-DharaneSegar/performanceTest
npx artillery run user.performance.test.yml
```

Replace user.performance.test.yml with the name of the performance test file you want to run.

## Importing and Loading Postman Collection

**Import Collection**: In the Postman application, click on the "Import" button located in the top left corner.

**Login and Obtain JWT Token**: Create a request for logging in to your application's authentication endpoint (POST /user/login). This request should include the necessary credentials (e.g., username and password) in the request body or headers.Upon successful authentication, the response should include a JWT token. Extract this token from the response.

**Set JWT Token**: For each end point, Look for the "Authorization" tab, usually located below the request URL and parameters.
Select Bearer Token as Typeand paste the genretated token.

**Run Requests**: To run a request, simply click on the "Send" button located on the request window.
