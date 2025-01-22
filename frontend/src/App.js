// import "./App.css";
import { React, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import RefreshHandler from "./Pages/RefreshHandler";
import FileView from './Components/fileView'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/fileView/:fileId" element={<FileView />} />
      </Routes>
    </div>
  );
}

export default App;
