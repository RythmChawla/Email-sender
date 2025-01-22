import React, { useEffect, useState } from "react";
import "./FileUploader.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FileUploader = () => {
  const [files, setFiles] = useState([]);

  // Fetch files from the backend
  const fetchFiles = async () => {
    try {
      const response = await fetch("http://localhost:8080/show");
      const result = await response.json();

      if (response.ok) {
        setFiles(result.files);
      } else {
        toast.error(result.message || "Failed to fetch files");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Unable to fetch files");
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "File uploaded successfully");
        fetchFiles(); // Refresh the file list
      } else {
        toast.error(result.message || "File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("File upload failed");
    }
  };

  // Handle file deletion
  const handleDelete = async (uniqueFileName) => {
    try {
      const response = await fetch(
        `http://localhost:8080/delete/${uniqueFileName}`
      );
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "File deleted successfully");
        fetchFiles(); // Refresh the file list
      } else {
        toast.error(result.message || "File deletion failed");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("File deletion failed");
    }
  };

  // Fetch files on component load
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="main">
      <div className="container-uploader">
        <header className="heading">
          <a href="/" className="headingLink">
            <h1 className="headingText">
              Display Data from CSV to Table Format
            </h1>
          </a>
        </header>

        <form className="fileUploadForm" onSubmit={handleUpload}>
          <div id="fileInput" className="formGroup">
            <label htmlFor="formFileSm" className="formLabel">
              Upload File
            </label>
            <input
              name="file"
              id="formFileSm"
              type="file"
              placeholder="Upload your CSV file"
              accept=".csv"
              required
            />
          </div>
          <div className="buttonContainer">
            <button id="addButton" className="btn btn-success" type="submit">
              Upload
            </button>
          </div>
        </form>

        <p id="head-view-table">Click your file link to view tables</p>

        {files.length > 0 ? (
          files.map((file) => (
            <div className="listContainer" key={file._id}>
              <div className="fileListRow">
                <div className="fileDescription">
                  <a
                    className="fileLink"
                    href={`/show/?file_id=${file._id}&page=1`}
                  >
                    {file.originalName}
                  </a>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    (window.location.href = `/fileView/${file._id}`)
                  }
                >
                  Show
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(file.file)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="noFiles">
            <h3>No files found in your list.</h3>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default FileUploader;
