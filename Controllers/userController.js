const Student = require("../Models/studentModel");
exports.postData = async (req, res, next) => {
  try {
    const body = req.body;

    // Extract Roll Number and Name from the request body
    const rollNumber = body["Roll Number"];
    const name = body["Student Name"];

    // Remove Roll Number and Name from the body to prepare for creating/updating
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

    // Iterate over the remaining keys to fill subjects in the semesters array
    for (const key in body) {
      if (body.hasOwnProperty(key) && body[key]) {
        semesters[0].subjects.push({
          subjectCode: key,
          score: parseInt(body[key]),
        });
      }
    }

    // Check if the student already exists in the database
    let student = await Student.findOne({ RollNumber: rollNumber });

    if (student) {
      student.name = name || student.name;
      const existingSemester = student.semesters.find(
        (sem) => sem.semesterNumber === semesters[0].semesterNumber
      );
      if (existingSemester) {
        // If the semester already exists, update the subjects
        existingSemester.subjects = semesters[0].subjects;
        existingSemester.backLogs = semesters[0].backLogs;
        existingSemester.credits = semesters[0].credits;
        existingSemester.sgpa = semesters[0].sgpa;
      } else {
        // If the semester doesn't exist, add it
        student.semesters.push(semesters[0]);
      }

      // Save the updated student record
      student = await student.save();
      res.status(200).json({
        status: "success",
        message: "Student data updated successfully",
        data: student,
      });
    } else {
      // If student does not exist, create a new record
      const newStudent = await Student.create({
        RollNumber: rollNumber,
        name,
        semesters,
      });

      res.status(201).json({
        status: "success",
        message: "Student created successfully",
        data: newStudent,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).send({
      msg: "Something went wrong",
      error: err.message,
    });
  }
};

exports.getResult = async (req, res, next) => {
  try {
    let query = Student.findOne({ rollNumber: req.params.id });
    const data = await query;
    if (!data) {
      return res.status(404).send({ msg: "Result not found" });
    }
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    res.status(500).send({
      msg: "Something went wrong",
      error: err.message,
    });
  }
};
