const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  RollNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  semesters: [],
  password: {
    type: String,
    select: false,
    default: function () {
      return this.rollNumber; // Default password as roll number
    },
  },
});

// Export the Student model
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
