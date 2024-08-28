const mongoose = require("mongoose");

const MarksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  }, // Reference to Student
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String, required: true },
  remarks: { type: String },
});

module.exports = mongoose.model("Marks", MarksSchema);
