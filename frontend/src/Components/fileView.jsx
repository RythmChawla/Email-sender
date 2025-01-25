import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./fileView.css";

const FileView = () => {
  const { fileId } = useParams(); // Extract fileId from URL
  const [head, setHead] = useState([]); // Column headers
  const [data, setData] = useState([]); // Current page data
  const [page, setPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const rowsPerPage = 100; // Number of rows per page

  // Fetch file data based on file ID, page, and rows per page
  const fetchFileData = async (fileId, page) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token"); 
    try {
      const response = await fetch(
        `http://localhost:8080/show?file_id=${fileId}&page=${page}&limit=${rowsPerPage}`,{
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token here
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setHead(result.head || []);
        setData(result.data || []);
        setPage(result.page || 1);
        setTotalPages(result.totalPages || 1);
      } else {
        setError(result.message || "Failed to fetch file data");
      }
    } catch (error) {
      console.error("Error fetching file data:", error);
      setError("An error occurred while fetching file data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when fileId or page changes
  useEffect(() => {
    if (fileId) {
      fetchFileData(fileId, page);
    }
  }, [fileId, page]);

  return (
    <div className="file-view">
      <header className="heading">
        <a href="/" className="headingLink">
          <h1 className="headingText">FILE VIEWER</h1>
        </a>
      </header>

      {/* Error message */}
      {error && <p className="error-message">{error}</p>}

      {/* Loading indicator */}
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* Data table */}
          <div className="container_view">
            <table id="sortTable" className="table">
              <thead>
                <tr>
                  {head.map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {head.map((column, colIndex) => (
                      <td key={colIndex}>{row[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav id="pagingNav" aria-label="Page navigation">
            <ul className="pagination">
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  First
                </button>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
              </li>
              <li className="page-item">
                <span className="page-link">Page {page} of {totalPages}</span>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </li>
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  Last
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default FileView;
