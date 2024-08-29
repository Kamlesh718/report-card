There was some issue regarding repo thats why i pasted the frontend code in here for reference

 # Download.js
function DownloadReport() {
  const handleDownload = async () => {
    try {
      const response = await fetch("http://localhost:5000/generate-report", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report-cards.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while downloading the report.");
    }
  };

  return <button onClick={handleDownload}>Download Report</button>;
}

export default DownloadReport;

# Upload.js
import  { useState } from "react";

function UploadForm() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
}

export default UploadForm;

# App.js

function App() {
  return (
    <div className="App">
      <h1>Student Report Card System</h1>
      <UploadForm />
      <DownloadReport />
    </div>
  );
}

export default App;

