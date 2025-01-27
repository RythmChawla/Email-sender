import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./fileView.css";

const StatusView = () => {
  const location = useLocation(); // Access passed state
  const { ids = [], statuses = [] } = location.state || {}; // Extract ids and statuses from state

  return (
    <div className="file-view">
      <header className="heading">
        <h1 className="headingText">SENT STATUS</h1>
      </header>

      {/* Table displaying IDs and statuses */}
      {ids.length > 0 && statuses.length > 0 ? (
        <div className="container_view">
          <h3>Email Results</h3>
          <table id="sortTable" className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, index) => (
                <tr key={index}>
                  <td>{id}</td>
                  <td>{statuses[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default StatusView;
