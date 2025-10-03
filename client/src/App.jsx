import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleSubmit = (value) => {
    if (value.trim() === "") {
      alert("Please enter a username");
      return;
    }

    setUsername(value);
    navigate("/home");
  };

  return (
    <Routes>
      <Route path="/" element={<Login onSubmit={handleSubmit} />} />
      <Route path="/home" element={<Home username={username} />} />
    </Routes>
  );
}

export default App;
