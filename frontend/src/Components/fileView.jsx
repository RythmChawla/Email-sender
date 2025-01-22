import React, { useEffect, useState } from "react";
import "./fileView.css";

const FileView = ({ fileId }) => {
  const [head, setHead] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch file data based on file ID
  const fetchFileData = async (fileId, page) => {
    try {
      const response = await fetch(`http://localhost:8080/show/?file_id=${fileId}&page=${page}`);
      const result = await response.json();

      if (response.ok) {
        setHead(result.head || []);
        setData(result.data || []);
        setPage(result.page || 1);
        setTotalPages(result.totalPages || 1);
      } else {
        console.error("Failed to fetch file data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching file data:", error);
    }
  };

  // Search functionality
  const searchTable = (searchValue, columnIndex) => {
    if (!data || !data.length) return;

    const filteredData = data.filter((row) =>
      row[columnIndex]?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setData(filteredData);
  };

  useEffect(() => {
    fetchFileData(fileId, page);
  }, [fileId, page]);

  return (
    <div className="file-view">
      <header className="heading">
        <a href="/" className="headingLink">
          <h1 className="headingText">FILE UPLOADER</h1>
        </a>
      </header>

      <div id="search-box">
        <input
          type="text"
          name="search"
          id="search"
          onChange={(e) => searchTable(e.target.value, document.getElementById("opt").value)}
          placeholder="Enter Text"
        />
        <span>Search Using</span>
        <select name="option" id="opt">
          {head.map((column, index) => (
            <option value={index} key={index}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="container">
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

      <nav id="pagingNav" aria-label="Page navigation">
        <ul className="pagination">
          <li className="page-item">
            <button className="page-link" onClick={() => setPage(1)} disabled={page === 1}>
              First
            </button>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              {page - 1}
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">{page}</span>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              {page + 1}
            </button>
          </li>
          <li className="page-item">
            <button className="page-link" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default FileView;
