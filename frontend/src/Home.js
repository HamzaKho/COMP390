import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = ({ onLogout }) => {
  const [popularGames, setPopularGames] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true); // Start loading
      try {
        // Replace 'YOUR_API_KEY' with your RAWG API key
        const popularResponse = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&dates=2023-01-01,2024-01-01&ordering=-rating`
        );
        const newReleasesResponse = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&dates=2023-09-01,2024-01-01&ordering=-released`
        );

        setPopularGames(popularResponse.data.results);
        setNewReleases(newReleasesResponse.data.results);
      } catch (error) {
        console.error("Error fetching data from RAWG API", error);
      }
      setIsLoading(false); // End loading
    };

    fetchGames();
  }, []);

  return (
    <div className="home">
      <div className="sidebar">
        {/* Other links */}
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="content">
        <div className="games-section">
          <h2>Popular Games</h2>
          <div className="games-list">
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="game loading-placeholder"></div>
                ))
              : popularGames.map((game) => (
                  <div key={game.id} className="game">
                    <img src={game.background_image} alt={game.name} />
                    <h3>{game.name}</h3>
                    {/* Other game details */}
                  </div>
                ))}
          </div>
        </div>
        <div className="games-section">
          <h2>Our Picks For You</h2>
          <div className="games-list">{/* Repeat for "our picks" games */}</div>
        </div>
        <div className="games-section">
          <h2>Latest Releases</h2>
          <div className="games-list">
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="game loading-placeholder"></div>
                ))
              : newReleases.map((game) => (
                  <div key={game.id} className="game">
                    <img src={game.background_image} alt={game.name} />
                    <h3>{game.name}</h3>
                    {/* Other game details */}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
