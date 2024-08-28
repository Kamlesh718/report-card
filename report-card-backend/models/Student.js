const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  rollNumber: { type: String, unique: true, required: true },
  personalDetails: {
    address: { type: String },
    contactNumber: { type: String },
  },
  marks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Marks" }], // References to Marks documents
});

module.exports = mongoose.model("Student", StudentSchema);
