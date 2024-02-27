import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";
import "./Sidebar.css";
import "./Modal.css";

const Profile = ({ onLogout, loggedInUserId }) => {
  const [favouriteGames, setFavouriteGames] = useState([]);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

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
            const gameDetailPromises = data.favouriteGames.map(
              async (gameId) => {
                const gameResponse = await fetch(
                  `https://api.rawg.io/api/games/${gameId}?key=32d80d72ca6b4f50836ace2da6d74fb8`
                );
                if (!gameResponse.ok)
                  throw new Error("Failed to fetch game details.");
                return gameResponse.json();
              }
            );
            const gamesDetails = await Promise.all(gameDetailPromises);
            const transformedGamesDetails = gamesDetails.map((game) => ({
              id: game.id,
              name: game.name,
              background_image: game.background_image,
              released: game.released,
              rating: game.rating,
            }));

            setFavouriteGames(transformedGamesDetails);
          } else {
            console.error("Received data is not an array", data.favouriteGames);
            setFavouriteGames([]);
          }
        } else {
          console.error("Error fetching favourite games", response.status);
        }
      } catch (error) {
        console.error("Error retrieving favourite games", error);
      }
    };
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/userReviews/${loggedInUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          const reviewsWithGameDetails = await Promise.all(
            data.map(async (review) => {
              const gameResponse = await fetch(
                `https://api.rawg.io/api/games/${review.game_id}?key=32d80d72ca6b4f50836ace2da6d74fb8`
              );
              if (!gameResponse.ok)
                throw new Error("Failed to fetch game details.");
              const gameData = await gameResponse.json();
              return {
                ...review,
                gameName: gameData.name,
                gameImage: gameData.background_image,
              };
            })
          );
          setReviews(reviewsWithGameDetails);
        } else {
          console.error("error getting reviews", response.status);
        }
      } catch (error) {
        console.error("error fetching reviews", error);
      }
    };
    fetchReviews();
    fetchUsername();
    fetchFavouriteGames();
  }, [loggedInUserId]);

  const openModal = (game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
    document.body.classList.add("active-modal");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
    document.body.classList.remove("active-modal");
  };

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
    setUsernameError("");
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

  function GameDetailsModal({ game, onClose }) {
    const [mainImage, setMainImage] = useState(game?.background_image ?? "");
    const [isFavourite, setIsFavourite] = useState(false);

    useEffect(() => {
      if (!game) return;

      const checkFavouriteStatus = async () => {
        try {
          const response = await fetch(
            `http://localhost:8081/isFavourite/${loggedInUserId}/${game.id}`
          );
          const data = await response.json();
          setIsFavourite(data.isFavourite);
        } catch (error) {
          console.error("Error checking favourite:", error);
        }
      };

      checkFavouriteStatus();
    }, [game, loggedInUserId]);

    const addToFavourites = async () => {
      try {
        const response = await fetch("http://localhost:8081/addFavourite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loggedInUserId,
            gameId: game.id,
          }),
        });
        if (response.ok) {
          setIsFavourite(true);
        }
      } catch (error) {
        console.error("Error adding to favourites:", error);
      }
    };

    const removeFromFavourites = async () => {
      try {
        const response = await fetch("http://localhost:8081/removeFavourite", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loggedInUserId,
            gameId: game.id,
          }),
        });
        if (response.ok) {
          setIsFavourite(false);
        }
      } catch (error) {
        console.error("Error removing from favourites:", error);
      }
    };

    const handleThumbnailClick = (imageUrl) => {
      setMainImage(imageUrl);
    };

    if (!game) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-header">
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <img
              src={game?.background_image}
              alt={game?.name}
              className="main-image"
            />
            <div className="thumbnail-container">
              {game?.short_screenshots?.map((screenshot) => (
                <img
                  key={screenshot.id}
                  src={screenshot.image}
                  alt="Game Screenshot Thumbnail"
                  onClick={() => setMainImage(screenshot.image)}
                  className="thumbnail-image"
                />
              ))}
            </div>
            <div className="game-thumbnails">
              {game.thumbnails &&
                game.thumbnails
                  .slice(0, 3)
                  .map((thumbnail, thumbIndex) => (
                    <img
                      key={thumbIndex}
                      src={thumbnail}
                      alt={`Thumbnail ${thumbIndex + 1}`}
                      className="game-thumbnail"
                    />
                  ))}
            </div>
            <h3>{game?.name}</h3>
            <p>Release Date: {game?.released}</p>
            <p>Rating: {game?.rating} / 5</p>
            <p>
              Genres:{" "}
              {game?.genres?.map((genre) => genre.name).join(", ") || "N/A"}
            </p>
            <p>
              Platforms:{" "}
              {game?.platforms
                ?.map((platform) => platform.platform?.name)
                .join(", ") || "N/A"}
            </p>
          </div>
          <div className="modal-footer">{/* Footer content */}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="sidebar">
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/gamerecommender">Game Recommender</Link>
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
                <div
                  key={index}
                  className="game"
                  onClick={() => openModal(game)}
                >
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
        <div className="reviews-section">
          <h3>Your Reviews:</h3>
          {reviews.length === 0 ? (
            <p>You haven't left any reviews yet!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review">
                  <div className="review-box">
                    <img
                      src={review.gameImage}
                      alt={review.gameName}
                      className="review-game-image"
                    />
                    <div className="review-text-container">
                      <h4>{review.gameName}</h4>
                      <h5>{review.star_rating}/5 stars</h5>
                      <p>{review.review_text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {isModalOpen && (
          <GameDetailsModal game={selectedGame} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default Profile;
