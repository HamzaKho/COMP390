import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = ({ onLogout }) => {
  // Assuming onLogout is passed as a prop
  return (
    <div className="home">
      <div className="sidebar">
        {/* Other links */}
        <Link to="/friends">Friends</Link>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>{" "}
        {/* Logout button */}
      </div>
      <div className="content">{/* Content of your home page goes here */}</div>
    </div>
  );
};

export default Home;
