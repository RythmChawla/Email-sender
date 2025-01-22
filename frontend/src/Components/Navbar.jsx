import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";
import { handleSuccess } from "../utils.js";

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const [loggedInUser, setloggedInUser] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setloggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User Logout");
    setIsAuthenticated(false);
    setShowDropdown(false);
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleDropdownToggle = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <nav className="navbar">
      <button className="navbar-toggle" onClick={handleMenuToggle}>
        ☰
      </button>
      <ul className={`navbar-links ${isMenuOpen ? "open" : ""}`}>
        <li className="navbar-logo">
          <img src={logo} alt="Logo" />
          <span>EchoMail</span>
        </li>
        <li>
          <a href="#home">Home</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#services">Services</a>
        </li>
        <li>
          <a href="#contact">Contact</a>
        </li>
      </ul>
      <div className="profile-icon" onClick={handleDropdownToggle} ref={dropdownRef}>
            👤
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              {isAuthenticated ? (
                <>
                  <div onClick={() => alert("View Profile")}>View Profile</div>
                  <div onClick={handleLogout}>Logout</div>
                </>
              ) : (
                <>
                  <div onClick={() => navigate("/signup")}>Signup</div>
                  <div onClick={() => navigate("/login")}>Login</div>
                </>
              )}
            </div>
          )}
    </nav>
  );
}

export default Navbar;
