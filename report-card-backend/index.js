const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const cors = require("cors");
mongoose.set("strictPopulate", false);
// Import models
const Student = require("./models/Student");
const Marks = require("./models/Marks");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

const upload = multer({ dest: "uploads/" });

mongoose
  .connect("mongodb://localhost:27017/reportCardDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Route for uploading Excel file and processing data
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    for (let entry of data) {
      let student = await Student.findOne({ rollNumber: entry.RollNumber });
      if (!student) {
        student = new Student({
          name: entry.Name,
          class: entry.Class,
          rollNumber: entry.RollNumber,
          personalDetails: {
            address: entry.Address,
            contactNumber: entry.ContactNumber,
          },
        });
        await student.save();
      }

      const marks = new Marks({
        student: student._id,
        subject: entry.Subject,
        marksObtained: entry.MarksObtained,
        totalMarks: entry.TotalMarks,
        grade: entry.Grade,
        remarks: entry.Remarks,
      });

      await marks.save();

      student.marks.push(marks._id);
      await student.save();
    }

    fs.unlinkSync(file.path);

    res.send("Data uploaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the file.");
  }
});

// Route for generating PDF report cards
app.get("/generate-report", async (req, res) => {
  try {
    const students = await Student.find().populate("marks");
    const pdfDoc = await PDFDocument.create();

    for (let student of students) {
      const page = pdfDoc.addPage([595, 842]); // A4 size
      page.drawText(`Report Card for ${student.name} `, {
        x: 50,
        y: 800,
        size: 18,
      });

      let yPosition = 750;

      student.marks.forEach((mark) => {
        page.drawText(`Subject: ${mark.subject}`, {
          x: 50,
          y: yPosition,
          size: 12,
        });
        page.drawText(
          `Marks Obtained: ${mark.marksObtained}/${mark.totalMarks}`,
          { x: 200, y: yPosition, size: 12 }
        );
        page.drawText(`Grade: ${mark.grade}`, {
          x: 350,
          y: yPosition,
          size: 12,
        });
        page.drawText(`Remarks: ${mark.remarks}`, {
          x: 450,
          y: yPosition,
          size: 12,
        });
        yPosition -= 20;
      });

      yPosition -= 30;
    }

    const pdfBytes = await pdfDoc.save();
    const pdfPath = "report-cards.pdf";
    fs.writeFileSync(pdfPath, pdfBytes);

    res.download(pdfPath, () => {
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while generating the report cards.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
