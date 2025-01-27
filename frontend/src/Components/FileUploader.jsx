import React, { useEffect, useState } from "react";
import "./FileUploader.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { closeToast } from "../utils";





const FileUploader = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  closeToast(toast); // This will now work safely
  const [ids, setIds] = useState([]);
  const [statuses, setStatuses] = useState([]);


  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from local storage
      let response = await fetch("http://localhost:8080/show", {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure "Bearer " prefix
          "Content-Type": "application/json", // Include token in header
        },
      });

      let result = await response.json();

      if (response.status === 401) {
        // Token expired, attempt to refresh it
        const refreshResponse = await fetch(
          "http://localhost:8080/refresh-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }), // Pass the expired token
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem("token", refreshData.jwtToken); // Store the new JWT token

          // Retry the fetch request with the new token
          response = await fetch("http://localhost:8080/show", {
            headers: {
              Authorization: `Bearer ${refreshData.jwtToken}`,
            },
          });
          result = await response.json();
        } else {
          toast.error("Session expired, please log in again.");
          navigate("/login"); // Redirect to login page if token refresh fails
          return;
        }
      }

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

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:8080/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        // "Content-Type": "application/json" // Not required for FormData
      },
      body: formData,
    });
    const result = await response.json();

    if (response.ok) {
      // Collect IDs and statuses
      const ids = result.results?.ids || [];
      const statuses = result.results?.statuses || [];

      console.log("IDs:", ids);
      console.log("Statuses:", statuses);

      // Store the IDs and statuses in arrays (e.g., local state)
      setIds(ids); // Assuming you have a state like `const [ids, setIds] = useState([]);`
      setStatuses(statuses); // Assuming you have a state like `const [statuses, setStatuses] = useState([]);`

      toast.success(result.message || "File uploaded and emails sent successfully");
      fetchFiles(); // Refresh the file list
      navigate("/status-view", { state: { ids, statuses } });
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
    console.log("Deleting file:", uniqueFileName);
    const token = localStorage.getItem("token"); 
    try {
      const response = await fetch(
        `http://localhost:8080/delete/${uniqueFileName}`,{
          method: "GET", // Make sure the method is DELETE
        headers: {
          Authorization: `Bearer ${token}`, // Include the Authorization header
          "Content-Type": "application/json", // Set content type (optional for DELETE)
        },
        }
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
          <div className="formGroup">
            <label htmlFor="SenderName" className="formLabel">
              Sender Name
            </label>
            <input
              type="text"
              name="SenderName"
              id="SenderName"
              placeholder="Enter your name..."
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="Subject" className="formLabel">
              Subject
            </label>
            <input
              type="text"
              name="Subject"
              id="Subject"
              placeholder="Enter email subject..."
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="EmailPrompt" className="formLabel">
              Email Prompt
            </label>
            <textarea
              name="EmailPrompt"
              id="EmailPrompt"
              rows="3"
              placeholder="Enter the email prompt..."
              required
            ></textarea>
          </div>
            <div className="formGroup">
              <label htmlFor="formFileSm" className="formLabel">
                Upload CSV File
              </label>
              <input
                name="file"
                id="formFileSm"
                type="file"
                placeholder="Upload your CSV file"
                accept=".csv"
                required
              />
              <button id="addButton" className="btn btn-success" type="submit">
                SEND MAILS
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
                  onClick={() => navigate(`/fileView/${file._id}`)}
                >
                  Show
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(file.filePath.split("\\").pop())}
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

