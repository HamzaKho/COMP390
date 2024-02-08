import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";
import Friends from "./Friends";
import PrivateRoute from "./PrivateRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true" // Initialize from local storage
  );
  const [loggedInUserId, setLoggedInUserId] = useState(
    localStorage.getItem("loggedInUserId") || null
  );

  const handleLoginSuccess = (userId) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUserId", userId);
    setIsLoggedIn(true);
    setLoggedInUserId(userId);
  };

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={handleLoginSuccess}
              loggedInUserId={loggedInUserId}
            />
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Home onLogout={handleLogout} loggedInUserId={loggedInUserId} />
            </PrivateRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Home onLogout={handleLogout} loggedInUserId={loggedInUserId} />
            </PrivateRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Friends
                loggedInUserId={loggedInUserId}
                onLogout={handleLogout}
              />
            </PrivateRoute>
          }
        />
        {/* ...other routes... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
