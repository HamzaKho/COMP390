import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import "./GameRecommender.css";

const GameRecommender = ({ onLogout, loggedInUserId }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImageUrl, setMainImageUrl] = useState("");

  useEffect(() => {
    fetchNextGame();
  }, []);

  useEffect(() => {
    if (currentGame && currentGame.image) {
      setMainImageUrl(currentGame.image);
    }
  }, [currentGame]);

  const handleThumbnailClick = (imageUrl) => {
    setMainImageUrl(imageUrl);
  };

  const fetchNextGame = async () => {
    setLoading(true);
    try {
      const preferencesResponse = await axios.get(
        `http://localhost:8081/userPreferences/${loggedInUserId}`
      );
      const preferredGameIds = preferencesResponse.data.map((preference) =>
        String(preference.gameId)
      );

      const page = Math.floor(Math.random() * 10) + 1; // Randomize the page to vary the pool of games
      const apiUrl = `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&ordering=-popularity&page_size=10&page=${page}`;

      const response = await axios.get(apiUrl);
      if (
        response.status === 200 &&
        response.data &&
        response.data.results.length > 0
      ) {
        // Filter out seen games
        const unregisteredGames = response.data.results.filter(
          (game) => !preferredGameIds.includes(String(game.id))
        );
        if (unregisteredGames.length > 0) {
          // Select a random game
          const randomIndex = Math.floor(
            Math.random() * unregisteredGames.length
          );
          const game = unregisteredGames[randomIndex];
          setCurrentGame({
            id: game.id,
            name: game.name,
            image: game.background_image,
            thumbnails: game.short_screenshots,
            releaseDate: game.released,
            genres: game.genres.map((genre) => genre.name),
            platforms: game.platforms,
          });
        } else {
          console.error("No new games to display");
          setCurrentGame(null);
        }
      } else {
        console.error("Failed to fetch games or no games found");
        setCurrentGame(null);
      }
    } catch (error) {
      console.error("Error fetching games or user preferences:", error);
      setCurrentGame(null);
    }
    setLoading(false);
  };

  const handleLike = async () => {
    console.log("Liking game:", currentGame.name);
    console.log(loggedInUserId);
    try {
      const fetchResponse = await fetch("http://localhost:8081/addPreference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loggedInUserId: loggedInUserId,
          gameId: currentGame.id,
          preference: "like",
        }),
      });
      if (fetchResponse.ok) {
        console.log("Game liked successfully");
        fetchNextGame();
      } else {
        console.log("Failed to like game");
      }
    } catch (error) {
      console.error("Error liking game", error);
    }
  };

  const handleDislike = async () => {
    console.log("Disliking game:", currentGame.name);
    console.log(loggedInUserId);
    try {
      const fetchResponse = await fetch("http://localhost:8081/addPreference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loggedInUserId: loggedInUserId,
          gameId: currentGame.id,
          preference: "dislike",
        }),
      });
      if (fetchResponse.ok) {
        console.log("Game disliked successfully");
        fetchNextGame();
      } else {
        console.log("Failed to like game");
      }
    } catch (error) {
      console.error("Error liking game", error);
    }
  };

  const handleSkip = async () => {
    // You might not need to actually call the API for skipping, but you can if you track skips
    console.log("Skipped", currentGame.id);
    fetchNextGame(); // Fetch the next game after responding
  };

  if (loading) {
    return (
      <div className="GameRecommender">
        <div className="sidebar">
          <Link to="/">Home</Link>
          <Link to="/friends">Friends</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/gamerecommender">Game Recommender</Link>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
        <div className="game-display">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="GameRecommender">
        <div className="sidebar">
          <Link to="/">Home</Link>
          <Link to="/friends">Friends</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/gamerecommender">Game Recommender</Link>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
        <div className="game-display">
          <h2>No more games to display</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="GameRecommender">
      <div className="sidebar">
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/gamerecommender">Game Recommender</Link>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="game-display">
        <h2>{currentGame.name}</h2>
        <p>Genres: {currentGame.genres.join(", ")}</p>
        <p>
          Platforms:{" "}
          {currentGame.platforms
            ?.map((platform) => platform.platform.name)
            .join(", ")}
        </p>
        <p>Released: {currentGame.releaseDate}</p>
        <img
          src={mainImageUrl}
          alt={currentGame.name}
          className="main-game-image"
        />
        <div className="thumbnails">
          {currentGame.thumbnails?.map((screenshot, index) => (
            <img
              key={index}
              src={screenshot.image}
              alt={`Thumbnail ${index + 1}`}
              className="thumbnail"
              onClick={() => handleThumbnailClick(screenshot.image)}
            />
          ))}
        </div>
        <div className="game-actions">
          <button onClick={handleLike}>Like</button>
          <button onClick={handleDislike}>Dislike</button>
          <button onClick={handleSkip}>Skip</button>
        </div>
      </div>
    </div>
  );
};
export default GameRecommender;
