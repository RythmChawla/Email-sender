import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSuccess } from "../utils.js";
import { ToastContainer } from "react-toastify";
import Navbar from "../Components/Navbar";
import "./Home.css";
import FileUploader from "../Components/FileUploader.jsx";

function Home({ isAuthenticated, setIsAuthenticated }) {
  const [loggedInUser, setloggedInUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setloggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logout");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {loggedInUser}!</h1>
          <button onClick={handleLogout}>Logout</button>
          <FileUploader/>
        </div>
      ) : (
        <div>
          <h1>Welcome to EchoMail!</h1>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Signup</button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Home;
