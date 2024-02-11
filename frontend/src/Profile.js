import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = ({ onLogout, loggedInUserId }) => {
  const [favouriteGames, setFavouriteGames] = useState([]);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/getUsername/${loggedInUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
        }
      } catch (error) {
        console.error("Error retrieving username", error);
      }
    };
    const fetchFavouriteGames = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/getFavouriteGames/${loggedInUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.favouriteGames)) {
            setFavouriteGames(data.favouriteGames);
          } else {
            console.error("Received data is not an array", data.favouriteGames);
            setFavouriteGames([]); // Reset the state or handle accordingly
          }
        } else {
          console.error("Error fetching Favourite games", response.status);
        }
      } catch (error) {
        console.error("Error retrieving favourite games", error);
      }
    };
    fetchUsername();
    fetchFavouriteGames();
  }, [loggedInUserId]);
  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
    setUsernameError(""); // Reset error message
  };
  const validateAndSubmitUsername = async () => {
    // Validate for alphanumeric values
    if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
      setUsernameError("Username must be alphanumeric.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/updateUsername/${loggedInUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newUsername }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsername(newUsername);
        setUsernameError("");
      } else {
        setUsernameError(data.message || "Username is taken.");
      }
    } catch (error) {
      console.error("Error updating username", error);
      setUsernameError("Failed to update username.");
    }
  };
  return (
    <div className="profile-container">
      <div className="sidebar">
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="content">
        <div className="user-info-section">
          <div className="username-display">
            <h4>Username: {username}</h4>
          </div>
          <div className="username-update">
            <input
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
              placeholder="New username"
              className="username-input"
            />
            <button
              onClick={validateAndSubmitUsername}
              className="update-button"
            >
              Change Username
            </button>
            {usernameError && <p className="error">{usernameError}</p>}
          </div>
        </div>
        <div className="favourite-games-section">
          <h3>Your Favourite Games:</h3>
          {favouriteGames.length === 0 ? (
            <p>You haven't got any favourite games yet!</p>
          ) : (
            <div className="games-list">
              {favouriteGames.map((game, index) => (
                <div key={index} className="game">
                  <img
                    src={game.background_image}
                    alt={game.name}
                    className="game-image"
                  />
                  <h3>{game.name}</h3>
                  {/* Additional game details can be added here */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Profile;
