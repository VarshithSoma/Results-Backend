const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Student = require("../Models/studentModel"); // Ensure this path is correct for your project
const fs = require("fs");
const bcrypt = require("bcrypt");

// Load environment variables from .env file
dotenv.config({ path: "./config.env" });
const DB = "mongodb://127.0.0.1:27017/results";

// Connect to MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Recommended for new applications
  })
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.error("DB connection error:", err));

// Read and parse student data from JSON file
const students = JSON.parse(fs.readFileSync(`./data.json`, "utf-8"));

// Function to import student data
const importData = async () => {
  try {
    //inserting each student
    for (const req of students) {
      const body = req;
      if (!body["Roll Number"]) {
        continue;
      }
      const rollNumber = body["Roll Number"];
      const name = body["Student Name"];
      delete body["Roll Number"];
      delete body["Student Name"];

      const semesters = [
        {
          subjects: [],
          backLogs: parseInt(body["Back Logs"]) || 0,
          credits: parseInt(body["Credits"]) || 0,
          sgpa: parseFloat(body["SGPA"]) || 0,
        },
      ];

      // Populate subjects from the remaining keys in the body
      for (const key in body) {
        if (body.hasOwnProperty(key) && body[key]) {
          semesters[0].subjects.push({
            subjectCode: key,
            score: parseInt(body[key]),
          });
        }
      }

      //alredy exits
      let student = await Student.findOne({ RollNumber: rollNumber });

      if (student) {
        //  existing student
        student.semesters.push(semesters[0]);

        // Save the updated student record
        await student.save();
        // console.log(`Student data updated successfully for ${name}`);
      } else {
        // Create new student record
        const newStudent = await Student.create({
          RollNumber: rollNumber,
          name,
          semesters,
          password: await bcrypt.hash(rollNumber, 12),
        });
        // console.log(`New student record created for ${name}`);
      }
    }

    console.log("All data successfully loaded");
    process.exit(); // Exit the process
  } catch (err) {
    console.error("Error importing data:", err);
    process.exit(1); // Exit with error code
  }
};

// Execute the import data function
importData();
